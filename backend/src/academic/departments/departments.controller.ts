import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private depts: DepartmentsService) {}

  @Get()
  findAll(@Query('collegeId') collegeId?: string) {
    return this.depts.findAll(collegeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depts.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  create(@Body() dto: CreateDepartmentDto) {
    return this.depts.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateDepartmentDto>) {
    return this.depts.update(id, dto);
  }
}
