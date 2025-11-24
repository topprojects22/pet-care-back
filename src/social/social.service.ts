import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PostType } from '@prisma/client';
import { createPaginatedResponse } from '../common/utils/response.util';

export interface SocialFeedQuery {
  page?: number;
  limit?: number;
  type?: PostType;
  hashtag?: string;
  userId?: number;
}

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получает ленту социальной сети с оптимизированными запросами
   */
  async getFeed(query: SocialFeedQuery, currentUserId?: number) {
    const { page = 1, limit = 20, type, hashtag, userId } = query;
    const skip = (page - 1) * limit;

    // Формируем условия WHERE
    const where: any = {
      ...(type && { postType: type }),
      ...(userId && { authorId: userId }),
    };

    // Если указан хештег, ищем в контенте
    if (hashtag) {
      where.content = {
        contains: `#${hashtag}`,
        mode: 'insensitive',
      };
    }

    // Оптимизированный запрос с select для уменьшения объема данных
    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          mediaUrls: true,
          postType: true,
          location: true,
          eventDate: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true,
              lastName: true,
              avatarPath: true,
            },
          },
          shelter: {
            select: {
              id: true,
              name: true,
              photos: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          // Проверяем, лайкнул ли текущий пользователь пост
          ...(currentUserId && {
            likes: {
              where: { userId: currentUserId },
              select: { id: true },
              take: 1,
            },
          }),
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.communityPost.count({ where }),
    ]);

    // Преобразуем данные для удобства фронтенда
    const data = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      mediaUrls: post.mediaUrls,
      postType: post.postType,
      location: post.location,
      eventDate: post.eventDate,
      isPinned: post.isPinned,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author
        ? {
            id: post.author.id,
            name: `${post.author.name || ''} ${post.author.lastName || ''}`.trim(),
            avatarPath: post.author.avatarPath,
          }
        : null,
      shelter: post.shelter,
      stats: {
        likes: post._count.likes,
        comments: post._count.comments,
      },
      isLiked: currentUserId ? (post.likes && post.likes.length > 0) : false,
      isReposted: false, // TODO: реализовать репосты
    }));

    return createPaginatedResponse(data, page, limit, total);
  }

  /**
   * Получает ленту по хештегу
   */
  async getFeedByHashtag(hashtag: string, query: Omit<SocialFeedQuery, 'hashtag'>, currentUserId?: number) {
    return this.getFeed({ ...query, hashtag }, currentUserId);
  }

  /**
   * Получает профиль пользователя для социальной сети
   */
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        lastName: true,
        avatarPath: true,
        createdAt: true,
        _count: {
          select: {
            communityPost: true,
            pets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: `${user.name || ''} ${user.lastName || ''}`.trim(),
      avatarPath: user.avatarPath,
      joinedAt: user.createdAt,
      stats: {
        posts: user._count.communityPost,
        pets: user._count.pets,
      },
    };
  }
}
