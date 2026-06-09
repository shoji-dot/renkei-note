-- AlterTable: 仕込み進捗に識別タグ・豚の産地・熟成期間を追加
ALTER TABLE "brewing_progress"
  ADD COLUMN "identificationTag" TEXT,
  ADD COLUMN "pigOrigin" TEXT,
  ADD COLUMN "agingPeriod" TEXT;
