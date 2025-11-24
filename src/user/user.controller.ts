import { Controller, Get, Put, Param, Body, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import {
  UpdateUserDto,
  UserPreferencesDto,
  ChangePasswordDto,
} from "./dto/user.dto";
import { Auth } from "../auth/decorators/auth.decorator";
import { OwnershipGuard } from "../common/guards/ownership.guard";
import { Resource } from "../common/decorators/resource.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("")
  @Get("profile")
  @Auth()
  async getUserProfile(@CurrentUser() user: User) {
    return this.userService.getUserProfile(user.id);
  }

  @Put(":id")
  @Auth()
  @Resource("user")
  @UseGuards(OwnershipGuard)
  async updateUserProfile(
    @Param("id") id: string,
    @Body() userData: UpdateUserDto,
    @CurrentUser() user: User
  ) {
    return this.userService.updateUserProfile(+id, userData);
  }

  @Get(":id/preferences")
  @Auth()
  @Resource("user")
  @UseGuards(OwnershipGuard)
  async getUserPreferences(@Param("id") id: string) {
    return this.userService.getUserPreferences(+id);
  }

  @Put(":id/preferences")
  @Auth()
  @Resource("user")
  @UseGuards(OwnershipGuard)
  async updateUserPreferences(
    @Param("id") id: string,
    @Body() preferences: UserPreferencesDto
  ) {
    return this.userService.updateUserPreferences(+id, preferences);
  }

  @Put(":id/password")
  @Auth()
  @Resource("user")
  @UseGuards(OwnershipGuard)
  async changePassword(
    @Param("id") id: string,
    @Body() passwordData: ChangePasswordDto
  ) {
    return this.userService.changePassword(+id, passwordData);
  }

  @Get(":id/favorites/clinics")
  @Auth()
  @Resource("user")
  @UseGuards(OwnershipGuard)
  async getFavoriteClinics(@Param("id") id: string) {
    return this.userService.getUserFavoriteClinics(+id);
  }

  @Put(":id/favorites/clinics/:clinicId")
  @Auth()
  @Resource("user")
  @UseGuards(OwnershipGuard)
  async toggleFavoriteClinic(
    @Param("id") id: string,
    @Param("clinicId") clinicId: string
  ) {
    return this.userService.toggleFavoriteClinic(+id, +clinicId);
  }
}
