"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, Heart, MessageCircle, Search, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { BentoCard } from "@/components/guest/bento-card";
import { guestStickerTags } from "@/components/guest/guest-sticker-tags";
import { SectionBlock } from "@/components/guest/section-block";
import { StickerTag } from "@/components/shared/sticker-tag";
import { Button } from "@/components/ui/button";
import { useGuestAuth } from "@/components/auth/guest-auth-provider";
import { getStoredGuestToken } from "@/lib/guest-auth-api";
import {
  createCommunityPost,
  deleteCommunityPost,
  getCommunityPosts,
  toggleCommunityPostLike,
  type CommunityPost,
  type CommunityPostCategory,
} from "@/lib/community-api";
import { cn } from "@/lib/utils";
import { useGuestExperience } from "@/state/guest-experience-provider";

const CATEGORY_META: Record<CommunityPostCategory, { label: string; icon: typeof Users; bg: string; text: string }> = {
  GENERAL: { label: "General", icon: MessageCircle, bg: "#3a5f84", text: "#ffffff" },
  EVENT: { label: "Event", icon: CalendarDays, bg: "#f9cb37", text: "#111111" },
  LOOKING_FOR: { label: "Looking for", icon: Search, bg: "#2fbc81", text: "#111111" },
  INTRO: { label: "Introduction", icon: Sparkles, bg: "#c62828", text: "#ffffff" },
};

const CATEGORY_OPTIONS: CommunityPostCategory[] = ["GENERAL", "EVENT", "LOOKING_FOR", "INTRO"];

function formatPostTime(value: string) {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "";
  }
}

export function GuestCommunity() {
  const { guest, isAuthenticated, openAuthModal } = useGuestAuth();
  const { selectedBookingId } = useGuestExperience();
  const activeBooking = useMemo(
    () => guest?.bookings?.find((booking) => booking.ezee_reservation_id === selectedBookingId) ?? null,
    [guest?.bookings, selectedBookingId],
  );

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<CommunityPostCategory>("GENERAL");
  const [posting, setPosting] = useState(false);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const canUse = Boolean(selectedBookingId && isAuthenticated && activeBooking);

  const loadPosts = useCallback(async () => {
    if (!selectedBookingId) {
      return;
    }
    const token = getStoredGuestToken();
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getCommunityPosts(selectedBookingId, token);
      setPosts(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load the community board.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedBookingId]);

  useEffect(() => {
    if (canUse) {
      void loadPosts();
    } else {
      setLoading(false);
    }
  }, [canUse, loadPosts]);

  const onSubmitPost = async () => {
    const trimmed = body.trim();
    if (!trimmed) {
      toast.error("Write something before posting.");
      return;
    }
    if (!selectedBookingId) {
      toast.error("No active booking found.");
      return;
    }
    if (!isAuthenticated) {
      openAuthModal("signin");
      return;
    }
    const token = getStoredGuestToken();
    if (!token) {
      openAuthModal("signin");
      return;
    }

    setPosting(true);
    try {
      const created = await createCommunityPost(selectedBookingId, { body: trimmed, category }, token);
      setPosts((previous) => [created, ...previous]);
      setBody("");
      toast.success("Posted to the community board.");
    } catch (postError) {
      const message = postError instanceof Error ? postError.message : "Unable to post right now.";
      toast.error(message);
    } finally {
      setPosting(false);
    }
  };

  const onToggleLike = async (postId: string) => {
    if (!selectedBookingId) return;
    const token = getStoredGuestToken();
    if (!token) {
      openAuthModal("signin");
      return;
    }

    setPendingLikeId(postId);
    // Optimistic update
    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? { ...post, liked_by_me: !post.liked_by_me, like_count: post.like_count + (post.liked_by_me ? -1 : 1) }
          : post,
      ),
    );
    try {
      const result = await toggleCommunityPostLike(selectedBookingId, postId, token);
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId ? { ...post, liked_by_me: result.liked_by_me, like_count: result.like_count } : post,
        ),
      );
    } catch (likeError) {
      // Revert on failure
      setPosts((previous) =>
        previous.map((post) =>
          post.id === postId
            ? { ...post, liked_by_me: !post.liked_by_me, like_count: post.like_count + (post.liked_by_me ? -1 : 1) }
            : post,
        ),
      );
      const message = likeError instanceof Error ? likeError.message : "Unable to update like.";
      toast.error(message);
    } finally {
      setPendingLikeId(null);
    }
  };

  const onDeletePost = async (postId: string) => {
    if (!selectedBookingId) return;
    const token = getStoredGuestToken();
    if (!token) {
      openAuthModal("signin");
      return;
    }

    setPendingDeleteId(postId);
    try {
      await deleteCommunityPost(selectedBookingId, postId, token);
      setPosts((previous) => previous.filter((post) => post.id !== postId));
      toast.success("Post removed.");
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete post.";
      toast.error(message);
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 pb-10 md:pb-12">
      {/* SECTION: Community Hero */}
      <section className="grid gap-5 pt-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" id="community-hero-section">
        <div className="rounded-[14px] border border-dashed border-white/24 bg-[#07070a] p-5 md:p-7" id="community-hero-card">
          <div className="flex items-start justify-end">
            <StickerTag bg="#3a5f84" className="px-3 py-1.5 text-[11px] font-black not-italic uppercase" label="Resident Board" rotate="rotate-[-2deg]" text="#ffffff" />
          </div>
          <h1 className="mt-3 font-sectiontitle text-[36px] leading-tight text-white md:text-[52px]">Who else is around this week?</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <BentoCard description="Posts are visible to everyone with an active or past stay at this property." icon={Users} sticker={{ label: "Residents Only", bg: "#3a5f84", text: "#ffffff", rotate: "rotate-[-2deg]" }} title="Property-wide" />
          <BentoCard description="Plan a meetup, ask for a gym buddy, or just say hi before you arrive." icon={Heart} sticker={{ label: "Community First", bg: "#f9cb37", text: "#111111", rotate: "rotate-[1deg]" }} title="Make it yours" />
        </div>
      </section>

      {/* SECTION: Board */}
      <SectionBlock
        description="Post an update or browse what other residents are up to."
        sticker={guestStickerTags.community}
        title="Community Board"
      >
        {!isAuthenticated ? (
          <div className="rounded-[14px] border border-dashed border-white/24 bg-[#07070a] p-6 text-center">
            <p className="text-sm text-white/70">Sign in to see and post on the community board.</p>
            <Button className="vh-cta-button mt-4 h-10 rounded-[10px] px-5 text-xs" onClick={() => openAuthModal("signin")} type="button">
              Sign in
            </Button>
          </div>
        ) : (
          <>
            {/* Composer */}
            <div className="rounded-[14px] border border-dashed border-white/24 bg-[#07070a] p-5" id="community-composer">
              <textarea
                className="vh-input min-h-[88px] resize-none"
                maxLength={500}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Share something with other residents..."
                value={body}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((option) => {
                    const meta = CATEGORY_META[option];
                    const Icon = meta.icon;
                    const active = category === option;
                    return (
                      <button
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase transition",
                          active ? "border-transparent text-black" : "border-white/20 text-white/70 hover:text-white",
                        )}
                        key={option}
                        onClick={() => setCategory(option)}
                        style={active ? { backgroundColor: meta.bg, color: meta.text } : undefined}
                        type="button"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="vh-cta-button h-9 rounded-[10px] px-5 text-[11px]"
                  disabled={!body.trim()}
                  loading={posting}
                  loadingText="Posting"
                  onClick={() => void onSubmitPost()}
                  type="button"
                >
                  Post
                </Button>
              </div>
            </div>

            {loading ? <p className="text-sm text-white/70">Loading the community board...</p> : null}
            {error ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-rose-300">{error}</p>
                <Button className="vh-cta-button h-8 rounded-[8px] bg-white px-3 text-xs text-[#07070a] hover:bg-white/90" onClick={() => void loadPosts()} type="button" variant="secondary">
                  Retry
                </Button>
              </div>
            ) : null}
            {!loading && !error && posts.length === 0 ? (
              <p className="text-sm text-white/70">No posts yet — be the first to say hello.</p>
            ) : null}

            {/* Feed */}
            <div className="space-y-3">
              {posts.map((post) => {
                const meta = CATEGORY_META[post.category] ?? CATEGORY_META.GENERAL;
                const Icon = meta.icon;
                return (
                  <article
                    className="rounded-[14px] border border-dashed border-white/24 bg-[#07070a] p-5"
                    id={`community-post-${post.id}`}
                    key={post.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--vh-pink)]/30 bg-[rgba(198,40,40,0.12)] text-[#f9cb37]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {post.author.name}
                            {post.author.is_me ? <span className="ml-2 text-[10px] font-black uppercase text-white/50">You</span> : null}
                          </p>
                          <p className="text-xs text-white/50">{formatPostTime(post.created_at)}</p>
                        </div>
                      </div>
                      <StickerTag bg={meta.bg} className="px-2.5 py-1 text-[10px] font-black not-italic uppercase" label={meta.label} rotate="rotate-[-1deg]" text={meta.text} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#cbd5e1]">{post.body}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <button
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-bold uppercase transition",
                          post.liked_by_me ? "text-[var(--vh-pink)]" : "text-white/50 hover:text-white",
                        )}
                        disabled={pendingLikeId === post.id}
                        onClick={() => void onToggleLike(post.id)}
                        type="button"
                      >
                        <Heart className={cn("h-4 w-4", post.liked_by_me && "fill-current")} />
                        {post.like_count > 0 ? post.like_count : "Like"}
                      </button>
                      {post.author.is_me ? (
                        <button
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-white/40 transition hover:text-rose-300"
                          disabled={pendingDeleteId === post.id}
                          onClick={() => void onDeletePost(post.id)}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </SectionBlock>
    </div>
  );
}
