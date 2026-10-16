-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Resident community board
--
-- Lets guests with an active/approved booking at a property post short
-- updates visible to other guests at the same property (intros, meetups,
-- "looking for a gym buddy", etc.) and like each other's posts.
-- ─────────────────────────────────────────────────────────────────────────────

-- CreateTable
CREATE TABLE "community_posts" (
    "id" VARCHAR(36) NOT NULL,
    "property_id" VARCHAR(36) NOT NULL,
    "guest_id" VARCHAR(36) NOT NULL,
    "category" VARCHAR(20) NOT NULL DEFAULT 'GENERAL',
    "body" VARCHAR(500) NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_post_likes" (
    "id" VARCHAR(36) NOT NULL,
    "post_id" VARCHAR(36) NOT NULL,
    "guest_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_community_posts_property" ON "community_posts"("property_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_community_post_like" ON "community_post_likes"("post_id", "guest_id");

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_post_likes" ADD CONSTRAINT "community_post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_post_likes" ADD CONSTRAINT "community_post_likes_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
