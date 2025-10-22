// src/community-post/comment.service.ts
@Injectable()
export class CommentService {
    constructor(private prisma: PrismaService) {}

    async createComment(userId: number, postId: number, dto: CreateCommentDto) {
        return this.prisma.postComment.create({
            data: {
                postId,
                userId,
                content: dto.content,
                parentId: dto.parentId,
            },
        });
    }
}