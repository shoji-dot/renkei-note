-- 商品開発メモテーブル削除
DROP TABLE IF EXISTS "product_dev_memo";

-- DevMemoStatus enum削除
DROP TYPE IF EXISTS "DevMemoStatus";

-- IdeaStatus enumに試作中・不採用を追加
ALTER TYPE "IdeaStatus" ADD VALUE IF NOT EXISTS 'shisakuchu';
ALTER TYPE "IdeaStatus" ADD VALUE IF NOT EXISTS 'fusaiyo';
