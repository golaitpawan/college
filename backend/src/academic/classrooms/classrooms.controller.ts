import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('classrooms')
@UseGuards(JwtAuthGuard)
export class ClassroomsController {
  constructor(private classrooms: ClassroomsService) {}

  @Get() findAll(@Query('collegeId') collegeId?: string, @Query('type') type?: string) {
    return this.classrooms.findAll(collegeId, type);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.classrooms.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  create(@Body() dto: CreateClassroomDto) { return this.classrooms.create(dto); }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateClassroomDto>) { return this.classrooms.update(id, dto); }
}
