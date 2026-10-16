import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import type { GuestJwtPayload } from '../../common/guards/guest-jwt.strategy';
import type { CreatePostDto } from './dto/create-post.dto';

const MAX_POSTS_RETURNED = 100;

@Injectable()
export class GuestCommunityService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  /**
   * Verify guest has access to the given ERI (booking) and return its
   * property_id — community posts are scoped to "everyone currently staying
   * at this property", not to the individual booking.
   */
  private async resolveProperty(guestId: string, eri: string): Promise<string> {
    const access = await this.prisma.booking_guest_access.findFirst({
      where: {
        ezee_reservation_id: eri,
        guest_id: guestId,
        status: 'APPROVED',
      },
      include: {
        ezee_booking_cache: { select: { property_id: true } },
      },
    });

    if (!access) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    const propertyId = access.ezee_booking_cache?.property_id;
    if (!propertyId) {
      throw new NotFoundException('Booking has no associated property');
    }

    return propertyId;
  }

  // ─── LIST ─────────────────────────────────────────────────────────────────

  async listPosts(guest: GuestJwtPayload, eri: string) {
    const propertyId = await this.resolveProperty(guest.guest_id, eri);

    const posts = await this.prisma.community_posts.findMany({
      where: { property_id: propertyId },
      orderBy: [{ is_pinned: 'desc' }, { created_at: 'desc' }],
      take: MAX_POSTS_RETURNED,
      include: {
        guests: { select: { id: true, name: true, profile_photo_url: true } },
        likes: { select: { guest_id: true } },
      },
    });

    return posts.map((post) => ({
      id: post.id,
      body: post.body,
      category: post.category,
      is_pinned: post.is_pinned,
      created_at: post.created_at,
      author: {
        id: post.guests.id,
        name: post.guests.name,
        profile_photo_url: post.guests.profile_photo_url,
        is_me: post.guests.id === guest.guest_id,
      },
      like_count: post.likes.length,
      liked_by_me: post.likes.some((like) => like.guest_id === guest.guest_id),
    }));
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────

  async createPost(guest: GuestJwtPayload, eri: string, dto: CreatePostDto) {
    const propertyId = await this.resolveProperty(guest.guest_id, eri);

    const body = dto.body.trim();
    if (!body) {
      throw new BadRequestException('Post body cannot be empty');
    }

    const post = await this.prisma.community_posts.create({
      data: {
        id: uuidv4(),
        property_id: propertyId,
        guest_id: guest.guest_id,
        body,
        category: dto.category ?? 'GENERAL',
      },
      include: {
        guests: { select: { id: true, name: true, profile_photo_url: true } },
      },
    });

    return {
      id: post.id,
      body: post.body,
      category: post.category,
      is_pinned: post.is_pinned,
      created_at: post.created_at,
      author: {
        id: post.guests.id,
        name: post.guests.name,
        profile_photo_url: post.guests.profile_photo_url,
        is_me: true,
      },
      like_count: 0,
      liked_by_me: false,
    };
  }

  // ─── LIKE / UNLIKE ────────────────────────────────────────────────────────

  async toggleLike(guest: GuestJwtPayload, eri: string, postId: string) {
    const propertyId = await this.resolveProperty(guest.guest_id, eri);

    const post = await this.prisma.community_posts.findUnique({ where: { id: postId } });
    if (!post || post.property_id !== propertyId) {
      throw new NotFoundException('Post not found');
    }

    const existing = await this.prisma.community_post_likes.findUnique({
      where: { uq_community_post_like: { post_id: postId, guest_id: guest.guest_id } },
    });

    if (existing) {
      await this.prisma.community_post_likes.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.community_post_likes.create({
        data: { id: uuidv4(), post_id: postId, guest_id: guest.guest_id },
      });
    }

    const like_count = await this.prisma.community_post_likes.count({ where: { post_id: postId } });

    return { liked_by_me: !existing, like_count };
  }

  // ─── DELETE (author only) ─────────────────────────────────────────────────

  async deletePost(guest: GuestJwtPayload, eri: string, postId: string) {
    const propertyId = await this.resolveProperty(guest.guest_id, eri);

    const post = await this.prisma.community_posts.findUnique({ where: { id: postId } });
    if (!post || post.property_id !== propertyId) {
      throw new NotFoundException('Post not found');
    }
    if (post.guest_id !== guest.guest_id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.community_posts.delete({ where: { id: postId } });

    return { message: 'Post deleted' };
  }
}
