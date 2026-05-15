import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  findAll(@Query() query: { role?: string; departmentId?: string }) {
    return this.users.findAll(query);
  }

  @Get('me')
  me(@CurrentUser() user: any) {
    return this.users.findOne(user.id);
  }

  @Get(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Post(':id/roles')
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  assignRole(
    @Param('id') id: string,
    @Body() body: { roleId: string; departmentId?: string },
  ) {
    return this.users.assignRole(id, body.roleId, body.departmentId);
  }

  @Patch(':id/status')
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' },
  ) {
    return this.users.updateStatus(id, body.status);
  }
}
