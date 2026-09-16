# SharePoint連携設計

## 推奨構成

~~~text
RequestHub UI
  ├─ MSAL / Microsoft Entra ID
  ├─ TanStack Query
  └─ SharePoint Repository
        └─ Microsoft Graph
              ├─ SharePoint Lists
              └─ Power Automate
~~~

画面コンポーネントからMicrosoft Graphを直接呼ばず、Repository層を経由させます。

## 推奨フォルダー

~~~text
lib/
  auth/
    msal-config.ts
  sharepoint/
    graph-client.ts
    requests-repository.ts
    forms-repository.ts
    approvals-repository.ts
    types.ts
  workflows/
    power-automate-client.ts
~~~

## 推奨SharePoint Lists

### RH_Forms

| 列 | 型 | 用途 |
|---|---|---|
| Title | 1行テキスト | フォーム名 |
| FormKey | 1行テキスト | 一意キー |
| Description | 複数行テキスト | 説明 |
| Category | 選択肢 | 経理、購買、人事など |
| TargetListName | 1行テキスト | 保存先リスト名 |
| ApprovalRouteJson | 複数行テキスト | 承認ルートJSON |
| IsPublished | Yes/No | 公開状態 |
| Version | 数値 | フォームバージョン |

### RH_FormFields

| 列 | 型 | 用途 |
|---|---|---|
| Title | 1行テキスト | 項目ラベル |
| FormKey | 1行テキスト | 親フォーム |
| FieldKey | 1行テキスト | 項目キー |
| FieldType | 選択肢 | text、textarea、number、date、select、file |
| IsRequired | Yes/No | 必須設定 |
| SortOrder | 数値 | 表示順 |
| OptionsJson | 複数行テキスト | 選択肢JSON |

### RH_Requests

| 列 | 型 | 用途 |
|---|---|---|
| Title | 1行テキスト | 申請件名 |
| RequestNumber | 1行テキスト | 申請番号 |
| FormKey | 1行テキスト | 使用フォーム |
| ApplicantUPN | 1行テキスト | 申請者 |
| Department | 1行テキスト | 所属部門 |
| Amount | 通貨 | 申請金額 |
| Status | 選択肢 | 下書き、承認待ち、承認済み、差し戻し |
| PayloadJson | 複数行テキスト | 動的項目 |
| CurrentStep | 数値 | 現在の承認段階 |

### RH_ApprovalHistory

| 列 | 型 | 用途 |
|---|---|---|
| RequestNumber | 1行テキスト | 対象申請 |
| StepNumber | 数値 | 承認段階 |
| ApproverUPN | 1行テキスト | 承認者 |
| Action | 選択肢 | 承認、否認、差し戻し |
| Comment | 複数行テキスト | コメント |
| ActionAt | 日付と時刻 | 処理日時 |

## Graph APIの基本操作

一覧取得：

~~~http
GET /sites/{site-id}/lists/{list-id}/items?expand=fields
~~~

登録：

~~~http
POST /sites/{site-id}/lists/{list-id}/items
Content-Type: application/json

{
  "fields": {
    "Title": "大阪支社 出張交通費",
    "FormKey": "expense",
    "Status": "承認待ち"
  }
}
~~~

更新：

~~~http
PATCH /sites/{site-id}/lists/{list-id}/items/{item-id}/fields
~~~

## 環境変数

.env.example をコピーして使用します。秘密情報はGitへコミットしません。

クライアントIDとテナントIDは公開クライアント設定ですが、クライアントシークレットや証明書はブラウザーへ渡さないでください。アプリ専用権限が必要な操作はサーバー側APIを経由します。

## Power Automate連携

推奨フロー：

1. RH_Requests に申請を登録
2. SharePointの「項目が作成されたとき」をトリガー
3. ApprovalRouteJson と金額・部門条件から承認者を決定
4. ApprovalsまたはTeams Adaptive Cardを送信
5. RH_ApprovalHistory に履歴追加
6. RH_Requests.Status と CurrentStep を更新
7. 申請者へTeamsまたはメールで通知

## UI側のQuery Key例

~~~ts
["requests", filters]
["request", requestNumber]
["forms"]
["form", formKey]
["approvals", currentUserUpn]
~~~

更新時は楽観的更新を使い、Graph APIが失敗した場合は元データへ戻して再試行ボタンを表示します。
