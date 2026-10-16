import { requestJson } from "@/lib/roost-api";

export type CommunityPostCategory = "GENERAL" | "EVENT" | "LOOKING_FOR" | "INTRO";

export type CommunityPostAuthor = {
  id: string;
  name: string;
  profile_photo_url: string | null;
  is_me: boolean;
};

export type CommunityPost = {
  id: string;
  body: string;
  category: CommunityPostCategory;
  is_pinned: boolean;
  created_at: string;
  author: CommunityPostAuthor;
  like_count: number;
  liked_by_me: boolean;
};

export type CreatePostPayload = {
  body: string;
  category?: CommunityPostCategory;
};

export async function getCommunityPosts(eri: string, token: string): Promise<CommunityPost[]> {
  return requestJson<CommunityPost[]>(`/guest/community/${encodeURIComponent(eri)}/posts`, {
    token,
  });
}

export async function createCommunityPost(
  eri: string,
  payload: CreatePostPayload,
  token: string,
): Promise<CommunityPost> {
  return requestJson<CommunityPost>(`/guest/community/${encodeURIComponent(eri)}/posts`, {
    method: "POST",
    body: payload,
    token,
  });
}

export async function toggleCommunityPostLike(
  eri: string,
  postId: string,
  token: string,
): Promise<{ liked_by_me: boolean; like_count: number }> {
  return requestJson<{ liked_by_me: boolean; like_count: number }>(
    `/guest/community/${encodeURIComponent(eri)}/posts/${encodeURIComponent(postId)}/like`,
    { method: "POST", token },
  );
}

export async function deleteCommunityPost(eri: string, postId: string, token: string): Promise<{ message: string }> {
  return requestJson<{ message: string }>(
    `/guest/community/${encodeURIComponent(eri)}/posts/${encodeURIComponent(postId)}`,
    { method: "DELETE", token },
  );
}
