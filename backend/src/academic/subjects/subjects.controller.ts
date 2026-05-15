import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard)
export class SubjectsController {
  constructor(private subjects: SubjectsService) {}

  @Get() findAll(@Query('courseId') courseId?: string) { return this.subjects.findAll(courseId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.subjects.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  create(@Body() dto: CreateSubjectDto) { return this.subjects.create(dto); }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  update(@Param('id') id: string, @Body() dto: Partial<CreateSubjectDto>) { return this.subjects.update(id, dto); }
}
