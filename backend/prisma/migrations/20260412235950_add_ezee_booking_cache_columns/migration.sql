-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: same class of bug as the other migrations added alongside this one —
-- these three columns exist in schema.prisma and are written by
-- prisma/seed.ts's booking seed step, but no migration ever added them.
-- Found via `prisma migrate diff --from-url <fully-migrated-db>
-- --to-schema-datamodel schema.prisma`, which is the authoritative way to
-- confirm no further gaps remain after the fixes in this batch.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE "ezee_booking_cache" ADD COLUMN "booking_rooms_json" JSONB;
ALTER TABLE "ezee_booking_cache" ADD COLUMN "ezee_reservation_no" VARCHAR(100);
ALTER TABLE "ezee_booking_cache" ADD COLUMN "ezee_sub_reservation_nos" TEXT;
