import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Get('/:name')
  getByValue(@Param('value') name: string) {
    return this.roleService.getRoleByValue(name);
  }
}
