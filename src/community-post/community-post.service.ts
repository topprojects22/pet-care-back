// src/community-post/community-post.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { PostType } from '@prisma/client';
import { createPaginatedResponse, formatUserName } from '../common/utils/response.util';

@Injectable()
export class CommunityPostService {
    constructor(private prisma: PrismaService) {}

    async createPost(userId: number, dto: CreateCommunityPostDto) {
        // Проверка: если указан shelterId — убедиться, что пользователь владеет приютом
        if (dto.shelterId) {
            const shelter = await this.prisma.shelter.findUnique({
                where: { id: dto.shelterId },
            });
            if (!shelter || shelter.ownerId !== userId) {
                throw new ForbiddenException('You do not own this shelter');
            }
        }

        // Для личных постов (BLOG) — shelterId = null
        const data: {
            title: string;
            content: string;
            mediaUrls: string[];
            postType: PostType;
            location?: string;
            eventDate?: Date;
            isPinned: boolean;
            author?: { connect: { id: number } };
            shelter?: { connect: { id: number } };
        } = {
            title: dto.title,
            content: dto.content,
            mediaUrls: dto.mediaUrls ?? [],
            postType: dto.postType,
            location: dto.location,
            eventDate: dto.eventDate,
            isPinned: false,
            author: dto.shelterId ? undefined : { connect: { id: userId } },
            shelter: dto.shelterId ? { connect: { id: dto.shelterId } } : undefined,
        };

        return this.prisma.communityPost.create({ data });
    }

    async findAll(query: { type?: PostType; page?: number; limit?: number; userId?: number }) {
        const { type, page = 1, limit = 20, userId } = query;
        const skip = (page - 1) * limit;

        // Оптимизированный запрос с select для уменьшения объема данных
        const [posts, total] = await Promise.all([
            this.prisma.communityPost.findMany({
                where: {
                    ...(type && { postType: type }),
                    OR: [{ author: { isNot: null } }, { shelter: { isNot: null } }],
                },
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
                    author: { select: { id: true, name: true, lastName: true, avatarPath: true } },
                    shelter: { select: { id: true, name: true, photos: true } },
                    _count: { select: { likes: true, comments: true } },
                    // Проверяем, лайкнул ли текущий пользователь пост
                    ...(userId && {
                        likes: {
                            where: { userId },
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
            this.prisma.communityPost.count({
                where: {
                    ...(type && { postType: type }),
                    OR: [{ author: { isNot: null } }, { shelter: { isNot: null } }],
                },
            }),
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
                    name: formatUserName(post.author.name, post.author.lastName),
                    avatarPath: post.author.avatarPath,
                }
                : null,
            shelter: post.shelter,
            stats: {
                likes: post._count.likes,
                comments: post._count.comments,
            },
            isLiked: userId ? (post.likes && post.likes.length > 0) : false,
            isReposted: false, // TODO: реализовать проверку репостов
        }));

        return createPaginatedResponse(data, page, limit, total);
    }

    async findOne(id: number, userId?: number) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, avatarPath: true } },
                shelter: { select: { id: true, name: true } },
                likes: userId ? {
                    where: { userId },
                    select: { id: true },
                    take: 1,
                } : undefined,
                comments: {
                    where: { parentId: null },
                    include: {
                        user: { select: { id: true, name: true, avatarPath: true } },
                        replies: {
                            include: {
                                user: { select: { id: true, name: true, avatarPath: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async updatePost(userId: number, postId: number, dto: UpdateCommunityPostDto) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) throw new NotFoundException('Post not found');

        // Проверка прав: автор или владелец приюта
        const isAuthor = post.authorId === userId;
        const isShelterOwner = post.shelterId
            ? await this.prisma.shelter.findFirst({
                where: { id: post.shelterId, ownerId: userId },
            })
            : false;

        if (!isAuthor && !isShelterOwner) {
            throw new ForbiddenException('Not authorized to edit this post');
        }

        return this.prisma.communityPost.update({
            where: { id: postId },
            data: dto,
        });
    }

    async removePost(userId: number, postId: number) {
        const post = await this.findOne(postId);
        // та же логика проверки прав
        // ... (аналогично update)

        return this.prisma.communityPost.delete({ where: { id: postId } });
    }

    /**
     * Создает репост существующего поста
     */
    async repostPost(userId: number, originalPostId: number, comment?: string) {
        // Проверяем, что оригинальный пост существует
        const originalPost = await this.prisma.communityPost.findUnique({
            where: { id: originalPostId },
            select: { id: true, title: true, content: true, authorId: true, shelterId: true, postType: true },
        });

        if (!originalPost) {
            throw new NotFoundException('Original post not found');
        }

        // Проверяем, что пользователь не репостит свой собственный пост
        if (originalPost.authorId === userId) {
            throw new BadRequestException('Cannot repost your own post');
        }

        // Проверяем, что пользователь еще не репостил этот пост
        const existingRepost = await this.prisma.communityPost.findFirst({
            where: {
                authorId: userId,
                content: {
                    contains: `[REPOST] ${originalPostId}`,
                },
            },
        });

        if (existingRepost) {
            throw new BadRequestException('You have already reposted this post');
        }

        // Создаем репост с меткой в контенте
        const repostContent = comment
            ? `[REPOST] ${originalPostId}\n\n${comment}\n\n---\nОригинал: ${originalPost.title}`
            : `[REPOST] ${originalPostId}\n\n---\nОригинал: ${originalPost.title}`;

        return this.prisma.communityPost.create({
            data: {
                title: `Репост: ${originalPost.title}`,
                content: repostContent,
                postType: originalPost.postType,
                author: { connect: { id: userId } },
            },
            include: {
                author: { select: { id: true, name: true, lastName: true, avatarPath: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });
    }
}