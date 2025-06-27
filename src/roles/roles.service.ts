import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}
  async createRole(dto: CreateRoleDto) {
    const role = await this.prisma.role.create({
      data: {
        ...dto,
      },
    });
    return role;
  }
  async getRoleByValue(name: string) {
    const role = await this.prisma.role.findUnique({
      where: { name },
      select: { name: true },
    });
    return role;
  }
}
