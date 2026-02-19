-- Seed glossary terms (idempotent via ON CONFLICT)

INSERT INTO "glossary_terms" ("id", "slug", "term", "definition", "category", "sort_order")
VALUES
  (gen_random_uuid(), 'assortment-mix',   'Assortment Mix',   'The planned distribution of season slots across product dimensions such as category, construction, weight, and selling window. Defines the shape of the season.', 'planning', 0),
  (gen_random_uuid(), 'target-slots',     'Target Slots',     'The total number of SKU slots planned for a season. Sets the capacity ceiling for the assortment.', 'planning', 1),
  (gen_random_uuid(), 'fill-rate',        'Fill Rate',        'The percentage of planned season slots that have been filled with a SKU concept.', 'planning', 2),
  (gen_random_uuid(), 'margin-target',    'Margin Target',    'The gross margin percentage the season is aiming to achieve across its assortment.', 'planning', 3),
  (gen_random_uuid(), 'complexity',       'Complexity',       'A numeric score representing the production complexity of a concept. Seasons have a total complexity budget that constrains the assortment.', 'planning', 4),
  (gen_random_uuid(), 'hard-cap',         'Hard Cap',         'The maximum number of SKUs allowed in a minor (drop) season. Enforces discipline on capsule releases.', 'planning', 5),
  (gen_random_uuid(), 'collection-mix',   'Collection Mix',   'The distribution of season slots across collections (e.g. Core, Material Story, Function). Shows how the assortment is balanced.', 'planning', 6),
  (gen_random_uuid(), 'evergreen-pct',    'Evergreen %',      'The share of season slots classified as Evergreen or Multi-Season tenure. Indicates how much of the assortment is carried forward vs. one-time.', 'planning', 7),
  (gen_random_uuid(), 'selling-window',   'Selling Window',   'The retail period a product is designed for — e.g. Core/Year-Round, Spring/Summer, Fall/Winter, or Transitional.', 'taxonomy', 8),
  (gen_random_uuid(), 'tenure',           'Tenure',           'How long a product stays in the assortment. Ranges from Evergreen (indefinite) to One-Time Capsule (single season).', 'taxonomy', 9),
  (gen_random_uuid(), 'construction',     'Construction',     'The garment build method — e.g. Knit, Woven, Cut & Sew, Fleece, Jersey. Determines manufacturing requirements.', 'taxonomy', 10),
  (gen_random_uuid(), 'weight-class',     'Weight Class',     'The material weight category — Light, Mid, Heavy, or Insulated. Affects seasonality, layering, and cost.', 'taxonomy', 11),
  (gen_random_uuid(), 'fit-block',        'Fit Block',        'The base fit template for a garment — e.g. Modern Classic, Relaxed, Slim. Defines the silhouette family.', 'taxonomy', 12),
  (gen_random_uuid(), 'use-case',         'Use Case',         'The intended wearing context — e.g. Everyday, Layering, Coastal Weather, Travel. Guides design and fabric decisions.', 'taxonomy', 13),
  (gen_random_uuid(), 'size-scale',       'Size Scale',       'The sizing system used for a product — e.g. Alpha (S–XXL), Numeric Waist (28–38), or One Size.', 'taxonomy', 14),
  (gen_random_uuid(), 'goods-class',      'Goods Class',      'Whether a product is Softgoods (apparel, textiles) or Hardgoods (accessories, equipment).', 'taxonomy', 15),
  (gen_random_uuid(), 'season-slot',      'Season Slot',      'A planned position in a season''s assortment. Slots start open and are filled when a SKU concept is assigned.', 'lifecycle', 16),
  (gen_random_uuid(), 'sku-concept',      'SKU Concept',      'A product concept progressing through the lifecycle — from draft through spec, sampling, costing, and into production.', 'lifecycle', 17),
  (gen_random_uuid(), 'core-program',     'Core Program',     'An evergreen product program (e.g. Fleece Program) that runs across seasons with a defined fabric spec, silhouettes, and base colorways.', 'lifecycle', 18),
  (gen_random_uuid(), 'replacement-flag', 'Replacement',      'Indicates a slot is replacing an existing product rather than adding a net-new SKU to the assortment.', 'lifecycle', 19),
  (gen_random_uuid(), 'product-type',     'Product Type',     'The specific garment type within a subcategory — e.g. Short-Sleeve Tee, Quarter Zip, Chino.', 'product', 20),
  (gen_random_uuid(), 'collection',       'Collection',       'A thematic grouping of products — e.g. Core (evergreen), Material Story (fabric-led), Function (performance), Origin (heritage).', 'product', 21)
ON CONFLICT ("slug") DO NOTHING;
