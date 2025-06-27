import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import {
  LoginAuthDto,
  AccessTokenAuthDto,
  RegisterAuthDto,
} from './dto/auth.dto';
import { PrismaService } from '../prisma.service';
import { faker } from '@faker-js/faker';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.validateUser(loginAuthDto);
    const tokens = await this.issueToken(user.id, user.role.name);

    const userFields = this.returnUserFields(user);
    return {
      userFields,
      ...tokens,
    };
  }
  async register(registerAuthDto: RegisterAuthDto) {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: registerAuthDto.email,
      },
    });
    if (existUser) {
      throw new BadRequestException('User already exist');
    }

    const user = await this.prisma.user.create({
      data: {
        email: registerAuthDto.email,
        name: faker.name.firstName(),
        avatarPath: faker.image.avatar(),
        phone: faker.phone.number('+7 (###) ###-##-##'),
        password: await hash(registerAuthDto.password),
        stripeCustomerId: '',
      },
    });

    const tokens = await this.issueToken(user.id, 'user');

    const userFields = this.returnUserFields(user);
    return {
      userFields,
      ...tokens,
    };
  }
  async getNewToken(accessTokenAuthDto: AccessTokenAuthDto) {
    const result = await this.jwt.verifyAsync(accessTokenAuthDto.refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid access token');
    }
    const user = await this.prisma.user.findUnique({
      where: {
        id: result.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatarPath: true,
        roleId: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        stripeCustomerId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    const tokens = await this.issueToken(user.id, user.role.name);
    const userFields = this.returnUserFields(user);
    return {
      userFields,
      ...tokens,
    };
  }

  private async issueToken(userId: number, role: string) {
    const data = { id: userId, role: role };
    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });
    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
  private returnUserFields(user: User) {
    return {
      id: user.id,
      email: user.email,
    };
  }
  private async validateUser(loginDto: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatarPath: true,
        roleId: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        stripeCustomerId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('User dont exist');
    }
    const isValid = await verify(user.password, loginDto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
