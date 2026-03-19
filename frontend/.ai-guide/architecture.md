# フロントエンドアーキテクチャ

## 概要

このフロントエンドは、React + TypeScript + Viteで構築されたシングルページアプリケーション（SPA）です。

## ディレクトリ構造

```
frontend/src/
├── App.tsx              # アプリケーションのルートコンポーネント
├── main.tsx             # エントリーポイント
├── components/          # UIコンポーネント
├── hooks/               # カスタムフック
├── routes/              # ルーティング設定
├── lib/                 # ユーティリティライブラリ
├── mock/                # モックデータとMSW設定
└── ai-guide/            # フロントエンド固有のAIガイド
```

## 主要コンポーネントの役割

### `App.tsx`
- アプリケーションのルートコンポーネント
- ルーティングの設定
- グローバルなプロバイダーの設定

### `components/`
- 再利用可能なUIコンポーネント
- UIライブラリ（shadcn/ui）のコンポーネント

### `hooks/`
- カスタムフック
- ビジネスロジックの抽象化

### `routes/`
- ページコンポーネント
- ルート固有のロジック
- ディレクトリ構造:
  ```
  routes/
  ├── profile/
  │   ├── index.tsx           # ページコンポーネント（UI）
  │   ├── hooks/
  │   │   ├── useProfileForm.ts      # プロフィール編集ロジック
  │   │   └── usePasswordChange.ts   # パスワード変更ロジック
  │   └── api.ts              # API呼び出し関数
  ├── admin/
  ├── auth/
  └── user/
  ```
- 各ルートは以下のファイルを持つことができる:
  - `index.tsx`: メインのページコンポーネント
  - `hooks/`: ページ固有のカスタムフック
  - `api.ts`: ページで使用するAPI関数
  - `components/`: ページ内でのみ使用するコンポーネント

### `lib/`
- ユーティリティ関数
- 共通ライブラリの設定

### `mock/`
- MSW（Mock Service Worker）の設定
- モックデータ定義

## 技術スタック

- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **ルーティング**: React Router
- **UIコンポーネント**: shadcn/ui
- **モック**: MSW（Mock Service Worker）

## アーキテクチャパターン

- コンポーネントベースアーキテクチャ
- カスタムフックによるロジックの分離
- コンポーネント合成パターン
