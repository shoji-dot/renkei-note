# 連携ノート（八ヶ岳トロバール × グートンデリ）

製造側と販売側の「今何が起きているか」を共有するための業務アプリ（MVP）。
詳細設計は `設計書_連携ノートMVP.md` を参照してください。

## 技術構成
- Next.js (App Router) / TypeScript / Tailwind CSS
- Railway PostgreSQL（Prisma ORM）
- NextAuth.js（Credentials認証）
- 画像はサーバーのファイルシステム / Railway Volume に保存

## セットアップ手順（ローカル）

1. 依存パッケージをインストール
   ```
   npm install
   ```
2. `.env.example` を `.env` にコピーし、値を設定
   - `DATABASE_URL`: PostgreSQLの接続文字列
   - `NEXTAUTH_SECRET`: `openssl rand -base64 32` で生成
   - `NEXTAUTH_URL`: `http://localhost:3000`
3. Prisma Client生成 & マイグレーション
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. マスターデータ投入（拠点・サンプルメンバー・初期管理者アカウント等）
   ```
   npx prisma db seed
   ```
   初期管理者: `admin@example.com` / `changeme123`（ログイン後すぐに変更してください）
5. 開発サーバー起動
   ```
   npm run dev
   ```

## Railwayへのデプロイ

1. GitHubにリポジトリを作成しpush
2. Railwayで「New Project」→「Deploy from GitHub repo」
3. Railway上にPostgreSQLプラグインを追加（`DATABASE_URL`が自動設定される）
4. Railway上にVolumeを作成し `/app/uploads` にマウント
5. 環境変数を設定：`DATABASE_URL`（自動）, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOAD_DIR=/app/uploads`
6. ビルドコマンド: `npx prisma generate && npx prisma migrate deploy && next build`
7. 起動コマンド: `next start`
8. mainブランチへのpushで自動デプロイ

## ディレクトリ構成（抜粋）
```
app/
  (auth)/login/        … ログイン
  (main)/              … ログイン後の画面群（トップ/投稿/タスク/写真/拠点別機能）
  api/                 … 認証・投稿・画像アップロードAPI
lib/                   … Prisma Client, NextAuth設定, 共通の型・選択肢
prisma/schema.prisma   … DBスキーマ
prisma/seed.ts         … 初期マスターデータ投入
uploads/               … アップロード画像の保存先（Railway Volumeをここにマウント）
```

## 注意
- このサンドボックス環境ではネットワーク制限により `npx prisma generate` を実行できていません。
  ローカルまたはRailway上で初回セットアップ時に必ず実行してください。
- iPhoneでのPWA利用: ブラウザでアクセス後、共有メニューから「ホーム画面に追加」でアプリのように使えます。
  `public/icons/icon-192.png` と `icon-512.png` を用意して配置してください（現状プレースホルダー無し）。
