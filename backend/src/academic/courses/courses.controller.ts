import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private courses: CoursesService) {}

  @Get() findAll(@Query('departmentId') departmentId?: string) { return this.courses.findAll(departmentId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.courses.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  create(@Body() dto: CreateCourseDto) { return this.courses.create(dto); }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  update(@Param('id') id: string, @Body() dto: Partial<CreateCourseDto>) { return this.courses.update(id, dto); }
}
