-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: same class of bug as 20260412235900_create_colive_tables — these three
-- columns exist in schema.prisma and are written to by
-- 20260422000000_seed_room_types_tds_koramangala (and several later
-- migrations), but no migration ever ran the ALTER TABLE that added them.
-- Added directly against the database outside `prisma migrate` at some
-- point. Captures that gap so migration history replays cleanly from an
-- empty database.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "room_types" ADD COLUMN "ezee_room_type_id" VARCHAR(50);
ALTER TABLE "room_types" ADD COLUMN "ezee_rate_plan_id" VARCHAR(50);
ALTER TABLE "room_types" ADD COLUMN "ezee_rate_type_id" VARCHAR(50);
