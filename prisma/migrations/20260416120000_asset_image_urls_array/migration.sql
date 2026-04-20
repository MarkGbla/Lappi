-- Asset: replace single imageUrl with imageUrls TEXT[]; preserve existing URL.

ALTER TABLE "Asset" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Asset"
SET "imageUrls" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL;

ALTER TABLE "Asset" DROP COLUMN "imageUrl";
