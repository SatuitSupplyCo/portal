-- Seed RBAC permissions and system roles (idempotent)

-- 1. Permissions
INSERT INTO "permissions" ("code", "group_key", "label", "description") VALUES
  ('studio.submit',       'studio',       'Submit to Studio',       'Create and submit studio entries'),
  ('studio.review',       'studio',       'Submit for Review',      'Submit studio entries for review'),
  ('studio.promote',      'studio',       'Promote to Concept',     'Promote studio entries to SKU concepts'),
  ('seasons.manage',      'seasons',      'Manage Seasons',         'Create, update, and lock seasons'),
  ('seasons.lock',        'seasons',      'Lock Seasons',           'Lock seasons to prevent further changes'),
  ('slots.create',        'seasons',      'Create Slots',           'Add slots to seasons'),
  ('slots.fill',          'seasons',      'Fill Slots',             'Fill season slots with concepts'),
  ('colors.manage',       'colors',       'Manage Colors',          'Add/remove colors from season palettes'),
  ('colors.confirm',      'colors',       'Confirm Colors',         'Confirm proposed season colors'),
  ('concepts.advance',    'concepts',     'Advance Concepts',       'Move concepts through lifecycle stages'),
  ('concepts.kill',       'concepts',     'Kill Concepts',          'Retire/kill active concepts'),
  ('concepts.override',   'concepts',     'Override Concepts',      'Override concept constraints (fabric, block changes)'),
  ('core_programs.manage', 'core_programs', 'Manage Core Programs', 'Create and update core programs'),
  ('sourcing.view',       'sourcing',     'View Sourcing',          'View factory directory and sourcing data'),
  ('sourcing.manage',     'sourcing',     'Manage Sourcing',        'Create and manage factory records'),
  ('costing.view',        'visibility',   'View Costing',           'View factory costing and pricing'),
  ('margins.view',        'visibility',   'View Margins',           'View margin data and targets')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint

-- 2. System roles
INSERT INTO "roles" ("id", "name", "slug", "description", "is_system")
VALUES
  (gen_random_uuid(), 'Founder',            'founder',            'Full access to all product lifecycle capabilities',                    true),
  (gen_random_uuid(), 'Product Lead',       'product-lead',       'Manages seasons, concepts, and product lifecycle (except kill/override)', true),
  (gen_random_uuid(), 'Studio Contributor', 'studio-contributor', 'Can create and submit studio entries for review',                     true),
  (gen_random_uuid(), 'External Designer',  'external-designer',  'External collaborator who can submit to the studio',                  true),
  (gen_random_uuid(), 'Factory Partner',    'factory-partner',    'Factory partner with view access to sourcing and costing',            true)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint

-- 3. Role-permission mappings

-- Founder: all permissions
INSERT INTO "role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.slug = 'founder'
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- Product Lead: all except concepts.kill and concepts.override
INSERT INTO "role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.slug = 'product-lead'
  AND p.code NOT IN ('concepts.kill', 'concepts.override')
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- Studio Contributor: studio.submit, studio.review
INSERT INTO "role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.slug = 'studio-contributor'
  AND p.code IN ('studio.submit', 'studio.review')
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- External Designer: studio.submit
INSERT INTO "role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.slug = 'external-designer'
  AND p.code IN ('studio.submit')
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- Factory Partner: sourcing.view, costing.view
INSERT INTO "role_permissions" ("role_id", "permission_code")
SELECT r.id, p.code
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.slug = 'factory-partner'
  AND p.code IN ('sourcing.view', 'costing.view')
ON CONFLICT DO NOTHING;
--> statement-breakpoint

-- 4. Migrate existing product_role → user_roles
INSERT INTO "user_roles" ("id", "user_id", "role_id")
SELECT gen_random_uuid(), u.id, r.id
FROM "users" u
JOIN "roles" r ON r.slug = CASE u.product_role
  WHEN 'founder'            THEN 'founder'
  WHEN 'product_lead'       THEN 'product-lead'
  WHEN 'studio_contributor' THEN 'studio-contributor'
  WHEN 'external_designer'  THEN 'external-designer'
  WHEN 'factory_partner'    THEN 'factory-partner'
END
WHERE u.product_role IS NOT NULL
ON CONFLICT ("user_id", "role_id") DO NOTHING;
