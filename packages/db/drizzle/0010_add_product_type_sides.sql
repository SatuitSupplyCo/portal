ALTER TABLE "product_types"
ADD COLUMN IF NOT EXISTS "sides" jsonb NOT NULL DEFAULT '["front","back"]'::jsonb;

UPDATE "product_types"
SET "sides" = '["front","back","top","bottom","left_side","right_side"]'::jsonb
WHERE "code" = 'bocce_set';
