import { Controller, Get, Put, Param, Body, Req } from "@nestjs/common";
import { UserService } from "./user.service";
import {
  UpdateUserDto,
  UserPreferencesDto,
  ChangePasswordDto,
} from "./dto/user.dto";
import { Auth } from "../auth/decorators/auth.decorator";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("")
  @Auth()
  async getUserProfile(@Req() req) {
    return this.userService.getUserProfile(+req.user.id);
  }

  @Put(":id")
  @Auth()
  async updateUserProfile(
    @Param("id") id: string,
    @Body() userData: UpdateUserDto
  ) {
    return this.userService.updateUserProfile(+id, userData);
  }

  @Get(":id/preferences")
  @Auth()
  async getUserPreferences(@Param("id") id: string) {
    return this.userService.getUserPreferences(+id);
  }

  @Put(":id/preferences")
  @Auth()
  async updateUserPreferences(
    @Param("id") id: string,
    @Body() preferences: UserPreferencesDto
  ) {
    return this.userService.updateUserPreferences(+id, preferences);
  }

  @Put(":id/password")
  @Auth()
  async changePassword(
    @Param("id") id: string,
    @Body() passwordData: ChangePasswordDto
  ) {
    return this.userService.changePassword(+id, passwordData);
  }

  @Get(":id/favorites/clinics")
  @Auth()
  async getFavoriteClinics(@Param("id") id: string) {
    return this.userService.getUserFavoriteClinics(+id);
  }

  @Put(":id/favorites/clinics/:clinicId")
  @Auth()
  async toggleFavoriteClinic(
    @Param("id") id: string,
    @Param("clinicId") clinicId: string
  ) {
    return this.userService.toggleFavoriteClinic(+id, +clinicId);
  }
}
