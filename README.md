# RequestHub Copilot Starter

SharePoint ListsとPower Automateをバックエンドに想定した、社内申請・承認ポータルのUI実装です。

現在のパッケージはダミーデータで完結します。実際のSharePoint認証情報、テナントID、サイトID、リストID、個人情報は含まれていません。

## 現在実装されている画面

- ダッシュボード
- 新規申請フォーム一覧
- 入力、確認、送信の2段階申請フォーム
- 申請一覧、検索、ステータス絞り込み、列並び替え
- 申請詳細ドロワー
- 承認タスク一覧、承認、差し戻し、コメント入力
- 申請フォーム管理
- フォーム追加と入力検証
- フォーム項目の追加、削除、ドラッグ並び替え
- 承認ステップの追加、ドラッグ並び替え
- 申請者向けフォームプレビュー
- SharePoint同期を想定したローディング、再取得、送信状態
- PC、タブレット、スマートフォン向けレスポンシブ表示

## 技術構成

- React 19 / TypeScript
- vinext（Next.js App Router互換）
- Tailwind CSS 4 + CSSデザイントークン
- TanStack Query
- TanStack Table v8
- React Hook Form
- Zod
- Motion for React
- Lucide React
- Cloudflare Workers互換ビルド

## 起動方法

必要環境はNode.js 22.13以上です。

~~~bash
npm install
npm run dev
~~~

表示されたローカルURLをEdgeまたはChromeで開いてください。

本番ビルド：

~~~bash
npm run build
~~~

## Copilotで試す手順

1. このフォルダーをVisual Studio Codeで開きます。
2. GitHub Copilot Chatを開きます。
3. COPILOT_PROMPT.md の内容をCopilot Chatへ貼り付けます。
4. Copilotに README.md、docs/SHAREPOINT_INTEGRATION.md、docs/ACCEPTANCE_TESTS.md を先に読ませます。
5. 変更後は npm run build を実行させます。

## 主要ファイル

- app/page.tsx：全画面、ダミーデータ、状態、操作
- app/globals.css：デザインシステム、レスポンシブ、アニメーション
- app/providers.tsx：TanStack QueryのProvider
- app/layout.tsx：Noto Sans JP、メタデータ、共通レイアウト
- vite.config.ts：vinextとCloudflare Workers向けビルド
- worker/index.ts：Workerエントリーポイント
- docs/SHAREPOINT_INTEGRATION.md：実データ接続の設計
- docs/ACCEPTANCE_TESTS.md：操作確認項目

## 重要な注意

app/page.tsx の templates、seedRequests、approvalTasks が現在のダミーデータです。

実運用化する場合は、これらを直接Graph APIへ置き換えず、lib/sharepoint/ のようなデータアクセス層を新設してください。画面側はTanStack Queryを通じてそのデータ層を呼ぶ構成にします。

ホスティング先固有のIDや認証情報は同梱していません。.openai/hosting.json はローカル実行用のダミー設定です。新しいSitesプロジェクトへ公開する場合は、発行された実際のIDへ置き換えてください。
