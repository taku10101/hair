# AI Guide サブディレクトリ作成ガイド

このドキュメントは、プロジェクト内のサブディレクトリに `ai-guide` ディレクトリを設置する際の標準構成を定義します。

## 必須ファイル（コア）

以下のファイルは、どのサブディレクトリの `ai-guide` でも**必須**とします：

### 1. `index.md`

- そのディレクトリ固有のAIガイドの目次
- ルートの `ai-guide` へのリンク
- ローカルファイルの一覧と説明

### 2. `architecture.md`

- そのモジュール/サブシステムのアーキテクチャ
- ディレクトリ構造
- 主要コンポーネントの役割

### 3. `coding-rules.md`

- そのディレクトリ固有のコーディング規約
- ルートの規約への参照と差分のみ記載

## 推奨ファイル（コンテキストに応じて）

プロジェクトの性質に応じて以下から選択：

### フロントエンド向け

- `components.md` - コンポーネント設計指針
- `state-and-hooks.md` - 状態管理とカスタムフック
- `styling.md` - スタイリング規約
- `form-handling.md` - フォーム処理

### バックエンド向け

- `api-design.md` - API設計指針
- `database.md` - データベース設計
- `security.md` - セキュリティ実装指針
- `middleware.md` - ミドルウェア実装

### 共通

- `testing.md` - テスト方針（ディレクトリ固有）
- `types-and-models.md` - 型定義とデータモデル
- `api-integration.md` - API連携方法
- `features.md` - 機能一覧と実装状況

## ディレクトリ構造例

```text
project-root/
├── .ai-guide/                     # ルートガイド（全体共通）
│   ├── index.md
│   ├── architecture.md
│   ├── coding-rules.md
│   └── ...
│
├── frontend/
│   └── ai-guide/                  # フロントエンド固有
│       ├── index.md
│       ├── architecture.md
│       ├── coding-rules.md
│       ├── components.md
│       └── styling.md
│
└── backend/
    └── ai-guide/                  # バックエンド固有
        ├── index.md
        ├── architecture.md
        ├── coding-rules.md
        ├── api-design.md
        └── database.md
```

## 作成時のチェックリスト

新しい `ai-guide` サブディレクトリを作成する際は：

- [ ] `index.md` を作成し、ルートガイドへのリンクを含める
- [ ] `architecture.md` でローカルアーキテクチャを説明
- [ ] `coding-rules.md` でローカル規約を定義（差分のみ）
- [ ] プロジェクトの性質に応じた推奨ファイルを選択
- [ ] 不要なファイルは作成しない（DRY原則）
- [ ] ルートの `ai-guide/index.md` から新しいサブディレクトリへのリンクを追加

## 重要な原則

1. **DRY原則**: ルートガイドと重複する内容は書かない
2. **参照優先**: 共通事項はルートガイドを参照
3. **固有性重視**: そのディレクトリ固有の情報のみ記載
4. **メンテナンス性**: 更新が必要な箇所を最小限に
5. **発見可能性**: ルートガイドから辿れるように

## 既存の ai-guide サブディレクトリ

現在、以下のサブディレクトリに `ai-guide` が存在します：

