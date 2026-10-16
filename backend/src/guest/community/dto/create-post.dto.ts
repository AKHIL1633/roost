import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const COMMUNITY_POST_CATEGORIES = ['GENERAL', 'EVENT', 'LOOKING_FOR', 'INTRO'] as const;
export type CommunityPostCategory = (typeof COMMUNITY_POST_CATEGORIES)[number];

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(500)
  body: string;

  @IsOptional()
  @IsString()
  @IsIn(COMMUNITY_POST_CATEGORIES)
  category?: CommunityPostCategory;
}
