import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GuestJwtGuard } from '../../common/guards/guest-jwt.guard';
import { CurrentGuest } from '../../common/decorators/current-guest.decorator';
import type { GuestJwtPayload } from '../../common/guards/guest-jwt.strategy';
import { GuestCommunityService } from './guest-community.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('guest/community')
@UseGuards(GuestJwtGuard)
export class GuestCommunityController {
  constructor(private readonly communityService: GuestCommunityService) {}

  /** List community posts for the property tied to this booking. */
  @Get(':eri/posts')
  listPosts(@CurrentGuest() guest: GuestJwtPayload, @Param('eri') eri: string) {
    return this.communityService.listPosts(guest, eri);
  }

  /** Create a new community post. */
  @Post(':eri/posts')
  createPost(
    @CurrentGuest() guest: GuestJwtPayload,
    @Param('eri') eri: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.communityService.createPost(guest, eri, dto);
  }

  /** Toggle like on a post. */
  @Post(':eri/posts/:postId/like')
  toggleLike(
    @CurrentGuest() guest: GuestJwtPayload,
    @Param('eri') eri: string,
    @Param('postId') postId: string,
  ) {
    return this.communityService.toggleLike(guest, eri, postId);
  }

  /** Delete your own post. */
  @Delete(':eri/posts/:postId')
  deletePost(
    @CurrentGuest() guest: GuestJwtPayload,
    @Param('eri') eri: string,
    @Param('postId') postId: string,
  ) {
    return this.communityService.deletePost(guest, eri, postId);
  }
}
