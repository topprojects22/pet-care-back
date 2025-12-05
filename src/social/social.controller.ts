import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';
import { PostType } from '@prisma/client';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  /**
   * GET /api/social/feed
   * Получает ленту социальной сети
   * 
   * Query параметры:
   * - page: номер страницы (по умолчанию 1)
   * - limit: количество постов на странице (по умолчанию 20)
   * - type: тип поста (BLOG, EVENT, ADOPTION, LOST_FOUND)
   * - hashtag: фильтр по хештегу
   * - userId: фильтр по автору
   */
  @Get('feed')
  async getFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: PostType,
    @Query('hashtag') hashtag?: string,
    @Query('userId') userId?: string,
    @CurrentUser() user?: User,
  ) {
    return this.socialService.getFeed(
      {
        page: page ? +page : undefined,
        limit: limit ? +limit : undefined,
        type,
        hashtag,
        userId: userId ? +userId : undefined,
      },
      user?.id,
    );
  }

  /**
   * GET /api/social/hashtags/:hashtag
   * Получает ленту по хештегу
   */
  @Get('hashtags/:hashtag')
  async getFeedByHashtag(
    @Param('hashtag') hashtag: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: PostType,
    @CurrentUser() user?: User,
  ) {
    return this.socialService.getFeedByHashtag(
      hashtag,
      {
        page: page ? +page : undefined,
        limit: limit ? +limit : undefined,
        type,
      },
      user?.id,
    );
  }

  /**
   * GET /api/social/users/:id
   * Получает профиль пользователя для социальной сети
   */
  @Get('user')
  async getUserProfile(@Param('id') id: string) {
    return this.socialService.getUserProfile(+id);
  }
}
