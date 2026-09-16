# Copilot向け実装プロンプト

以下をGitHub Copilot Chatへ貼り付けてください。

---

このリポジトリは、SharePoint ListsとPower Automateをバックエンドに想定した社内申請・承認ポータル「RequestHub」です。

まず次のファイルをすべて読み、現在の設計と実装済み機能を把握してください。

- README.md
- app/page.tsx
- app/globals.css
- app/providers.tsx
- docs/SHAREPOINT_INTEGRATION.md
- docs/ACCEPTANCE_TESTS.md

目的：

1. 現在のUIと操作性を維持したまま、保守しやすいコンポーネント構成へ分割する
2. ダミーデータ層を、Microsoft Graph経由でSharePoint Listsへ接続できる構成へ置き換える
3. Power Automateへ申請・承認イベントを連携できるようにする
4. エラー、空状態、読み込み中、権限不足、再試行を画面へ実装する
5. Noto Sans JP、現在の色・余白・レスポンシブデザインを維持する

必須条件：

- React、TypeScript、TanStack Query、TanStack Table、React Hook Form、Zod、Motion、Lucide Reactを継続利用する
- SharePointやMicrosoft Graphの認証情報をソースへ直書きしない
- app/page.tsx を機能単位へ分割しても、既存操作を失わない
- 申請フォーム管理では、フォーム追加、プレビュー、項目追加・削除・並べ替え、承認ステップ追加・並べ替えを維持する
- 申請フォームでは入力検証、確認画面、送信中表示、完了通知を維持する
- 申請一覧では検索、絞り込み、並び替え、詳細表示を維持する
- アクセシビリティとキーボード操作を維持する
- 最後に npm run build を実行し、エラーを解消する

最初の作業として、コードを変更する前に以下を回答してください。

1. 現在のコンポーネント構成
2. 分割後のファイル構成案
3. SharePoint連携で追加するデータアクセス層
4. 実装順序
5. 既存機能を守るための確認方法

本物のMicrosoft Entra ID、SharePoint、Power Automate環境が与えられていない場合は、接続可能なインターフェースとモック実装まで作成し、架空の資格情報を作らないでください。

---
