-- Roleをenumからtext型に変換（Railpackのキャッシュ問題を回避）
ALTER TABLE "members" ALTER COLUMN "role" TYPE TEXT USING "role"::TEXT;
ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'trobar';
DROP TYPE "Role";
