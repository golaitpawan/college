import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode,
} from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('timetables')
@UseGuards(JwtAuthGuard)
export class TimetableController {
  constructor(private timetable: TimetableService) {}

  @Get()
  findAll(
    @Query('sectionId') sectionId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    return this.timetable.findAll(sectionId, departmentId, status);
  }

  @Get('student')
  forStudent(@CurrentUser() user: any) {
    return this.timetable.findForStudent(user.id);
  }

  @Get('teacher')
  forTeacher(@CurrentUser() user: any) {
    return this.timetable.findForTeacher(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timetable.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD, RoleName.COORDINATOR)
  create(@Body() dto: CreateTimetableDto, @CurrentUser() user: any) {
    return this.timetable.create(dto, user.id);
  }

  @Post(':id/entries')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD, RoleName.COORDINATOR)
  addEntry(@Param('id') id: string, @Body() dto: CreateEntryDto) {
    return this.timetable.addEntry(id, dto);
  }

  @Delete(':id/entries/:entryId')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD, RoleName.COORDINATOR)
  removeEntry(@Param('id') id: string, @Param('entryId') entryId: string) {
    return this.timetable.removeEntry(id, entryId);
  }

  @Post(':id/validate')
  @HttpCode(200)
  validate(@Param('id') id: string) {
    return this.timetable.validate(id);
  }

  @Post(':id/submit')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD, RoleName.COORDINATOR)
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timetable.submit(id, user.id);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  approve(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { comment?: string }) {
    return this.timetable.approve(id, user.id, body.comment);
  }

  @Post(':id/request-changes')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  requestChanges(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { comment: string }) {
    return this.timetable.requestChanges(id, user.id, body.comment);
  }

  @Post(':id/publish')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.timetable.publish(id, user.id);
  }
}
