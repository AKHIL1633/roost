-- ═══════════════════════════════════════════════════════════════════════════
-- Fix: the colive_* feature tables were never captured in migration history.
--
-- They exist in schema.prisma and in the real deployed database, but no
-- migration file ever ran a CREATE TABLE for any of them — they were added
-- directly against the database outside of `prisma migrate` at some point
-- (most likely via `prisma db push` during early colive-feature development),
-- which is invisible to migration history. The next migration in sequence,
-- 20260413000000_rename_property_ids_to_ezee_codes, already assumes these
-- tables exist (it DELETEs/UPDATEs/ALTERs them), so applying migration
-- history from scratch on an empty database fails at that point with
-- "relation \"colive_draft_bookings\" does not exist".
--
-- This migration creates them with the shape they had AT THAT POINT in
-- history — i.e. BEFORE 20260423000002_colive_duration_days later renames
-- duration_months -> duration_days on colive_quotes / colive_draft_bookings.
-- That keeps every subsequent migration's statements valid as originally
-- written, instead of papering over the gap by editing later migrations.
--
-- Column/index/constraint shapes below are generated from the current
-- schema.prisma via `prisma migrate diff --from-empty`, then hand-adjusted
-- for the one historical difference (duration_months, not duration_days).
-- ═══════════════════════════════════════════════════════════════════════════

-- CreateTable
CREATE TABLE "colive_locations" (
    "id" VARCHAR(36) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colive_plans" (
    "id" VARCHAR(36) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "recommended_stay_type" VARCHAR(20) NOT NULL,
    "accent_hex" VARCHAR(10),
    "badge_copy" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colive_property_content" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "location_id" VARCHAR(36) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "headline" VARCHAR(200),
    "subheadline" VARCHAR(300),
    "description" TEXT,
    "microcopy" VARCHAR(300),
    "hero_image_url" VARCHAR(500),
    "secondary_image_url" VARCHAR(500),
    "supporting_image_urls" JSONB DEFAULT '[]',
    "gallery_count" INTEGER,
    "primary_tag" VARCHAR(50),
    "secondary_tag" VARCHAR(50),
    "rating" DECIMAL(2,1),
    "rating_label" VARCHAR(50),
    "amenities" JSONB DEFAULT '[]',
    "benefits" JSONB DEFAULT '[]',
    "stories" JSONB DEFAULT '[]',
    "checkout_notes" JSONB DEFAULT '[]',
    "recommended_for" JSONB DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_property_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colive_room_options" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "room_type_id" VARCHAR(36) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "feature_points" JSONB DEFAULT '[]',
    "max_guests" INTEGER DEFAULT 1,
    "recommended_for" JSONB DEFAULT '[]',
    "thumbnail_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_room_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colive_addons" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "pricing_model" VARCHAR(20) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(5) NOT NULL DEFAULT 'INR',
    "max_quantity" INTEGER,
    "default_quantity" INTEGER DEFAULT 0,
    "category" VARCHAR(30),
    "icon_hint" VARCHAR(50),
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "availability_message" VARCHAR(200),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_addons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colive_search_sessions" (
    "id" VARCHAR(36) NOT NULL,
    "location_id" VARCHAR(36),
    "location_slug" VARCHAR(50),
    "move_in_date" VARCHAR(10),
    "duration_months" INTEGER,
    "stay_type" VARCHAR(20),
    "guest_count" INTEGER,
    "plan_id" VARCHAR(36),
    "currency" VARCHAR(5) DEFAULT 'INR',
    "result_count" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_search_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable (duration_months here, not duration_days — renamed later by
-- 20260423000002_colive_duration_days, which this migration predates)
CREATE TABLE "colive_quotes" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "guest_id" VARCHAR(36),
    "room_option_id" VARCHAR(36) NOT NULL,
    "move_in_date" DATE NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "stay_type" VARCHAR(20) NOT NULL,
    "room_line_total" DECIMAL(10,2) NOT NULL,
    "addons_json" JSONB DEFAULT '[]',
    "included_items_json" JSONB DEFAULT '[]',
    "room_subtotal" DECIMAL(10,2) NOT NULL,
    "addon_subtotal" DECIMAL(10,2) NOT NULL,
    "discount_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deposit_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_total" DECIMAL(10,2) NOT NULL,
    "grand_total" DECIMAL(10,2) NOT NULL,
    "monthly_savings" DECIMAL(10,2),
    "total_savings" DECIMAL(10,2),
    "pricing_notes_json" JSONB DEFAULT '[]',
    "coupon_code" VARCHAR(30),
    "currency" VARCHAR(5) NOT NULL DEFAULT 'INR',
    "ezee_rate_per_night" DECIMAL(10,2),
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable (duration_months here, not duration_days — see note above)
CREATE TABLE "colive_draft_bookings" (
    "id" VARCHAR(36) NOT NULL,
    "booking_reference" VARCHAR(30) NOT NULL,
    "quote_id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "guest_id" VARCHAR(36),
    "room_option_id" VARCHAR(36) NOT NULL,
    "room_type_id" VARCHAR(36) NOT NULL,
    "move_in_date" DATE NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "stay_type" VARCHAR(20) NOT NULL,
    "estimated_checkout" DATE,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "addons_json" JSONB DEFAULT '[]',
    "room_subtotal" DECIMAL(10,2) NOT NULL,
    "addon_subtotal" DECIMAL(10,2) NOT NULL,
    "tax_total" DECIMAL(10,2) NOT NULL,
    "grand_total" DECIMAL(10,2) NOT NULL,
    "source" VARCHAR(30) NOT NULL DEFAULT 'web_colive_flow',
    "notes" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "payment_id" VARCHAR(36),
    "razorpay_order_id" VARCHAR(100),
    "ezee_reservation_no" VARCHAR(100),
    "ezee_sync_status" VARCHAR(20) NOT NULL DEFAULT 'NOT_SYNCED',
    "onboarding_json" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colive_draft_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colive_locations_slug_key" ON "colive_locations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "colive_plans_slug_key" ON "colive_plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "colive_property_content_slug_key" ON "colive_property_content"("slug");

-- CreateIndex
CREATE INDEX "idx_colive_content_property" ON "colive_property_content"("property_id");

-- CreateIndex
CREATE INDEX "idx_colive_content_location" ON "colive_property_content"("location_id");

-- CreateIndex
CREATE INDEX "idx_colive_rooms_property" ON "colive_room_options"("property_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "colive_room_options_property_id_slug_key" ON "colive_room_options"("property_id", "slug");

-- CreateIndex
CREATE INDEX "idx_colive_addons_property" ON "colive_addons"("property_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "colive_addons_property_id_slug_key" ON "colive_addons"("property_id", "slug");

-- CreateIndex
CREATE INDEX "idx_colive_search_location" ON "colive_search_sessions"("location_slug", "created_at");

-- CreateIndex
CREATE INDEX "idx_colive_quotes_guest" ON "colive_quotes"("guest_id");

-- CreateIndex
CREATE INDEX "idx_colive_quotes_expiry" ON "colive_quotes"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "colive_draft_bookings_booking_reference_key" ON "colive_draft_bookings"("booking_reference");

-- CreateIndex
CREATE INDEX "idx_colive_draft_guest" ON "colive_draft_bookings"("guest_id");

-- CreateIndex
CREATE INDEX "idx_colive_draft_status" ON "colive_draft_bookings"("status");

-- CreateIndex
CREATE INDEX "idx_colive_draft_ref" ON "colive_draft_bookings"("booking_reference");

-- AddForeignKey (properties exist by this point — created in 20260316000000_init)
ALTER TABLE "colive_property_content" ADD CONSTRAINT "colive_property_content_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_property_content" ADD CONSTRAINT "colive_property_content_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "colive_locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_room_options" ADD CONSTRAINT "colive_room_options_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_room_options" ADD CONSTRAINT "colive_room_options_room_type_id_fkey" FOREIGN KEY ("room_type_id") REFERENCES "room_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_addons" ADD CONSTRAINT "colive_addons_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_quotes" ADD CONSTRAINT "colive_quotes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_quotes" ADD CONSTRAINT "colive_quotes_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_draft_bookings" ADD CONSTRAINT "colive_draft_bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "colive_draft_bookings" ADD CONSTRAINT "colive_draft_bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
