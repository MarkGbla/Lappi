-- Asset: store opaque UploadThing file keys, not full URLs.
-- URLs are reconstructed at render time so we can move CDN endpoints without rewriting rows.

ALTER TABLE "Asset" RENAME COLUMN "imageUrls" TO "imageKeys";

-- Strip any legacy full-URL values down to the file key (segment after /f/).
UPDATE "Asset"
SET "imageKeys" = (
  SELECT array_agg(regexp_replace(k, '^https?://[^/]+/f/', ''))
  FROM unnest("imageKeys") k
)
WHERE cardinality("imageKeys") > 0;
