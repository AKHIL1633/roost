-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: same class of bug as the colive-tables and ezee-room-type-columns
-- migrations above — these three baseline property rows were inserted
-- directly against the database outside `prisma migrate` (almost certainly
-- via the original `prisma db seed` run), never captured as a migration.
--
-- 20260413000000_rename_property_ids_to_ezee_codes assumes they already
-- exist: it DELETEs prop-bandra-001 / prop-koramangala-b and renames
-- prop-koramangala-a -> 60765. Postgres UPDATE/DELETE against 0 matching
-- rows doesn't error, so that migration silently no-ops on a fresh database
-- — leaving no properties.id = '60765' row for the dozens of later
-- migrations (starting with 20260422000000_seed_room_types_tds_koramangala)
-- that reference it via foreign key.
--
-- Minimal placeholder values — these rows are immediately deleted/renamed
-- by the very next migration either way, so only columns with a NOT NULL
-- constraint at this point in schema history (see 20260316000000_init) need
-- real values.
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO "properties" ("id", "name", "address", "city") VALUES
  ('prop-koramangala-a', 'Koramangala A (placeholder)', 'Koramangala, Bengaluru', 'Bengaluru'),
  ('prop-bandra-001', 'Bandra (dev placeholder)', 'Bandra, Mumbai', 'Mumbai'),
  ('prop-koramangala-b', 'Koramangala B (placeholder)', 'Koramangala, Bengaluru', 'Bengaluru');
