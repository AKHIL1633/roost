import { Module } from '@nestjs/common';
import { GuestCommunityController } from './guest-community.controller';
import { GuestCommunityService } from './guest-community.service';

@Module({
  controllers: [GuestCommunityController],
  providers: [GuestCommunityService],
})
export class GuestCommunityModule {}
