import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AcademicSessionsService } from './academic-sessions.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('academic-sessions')
@UseGuards(JwtAuthGuard)
export class AcademicSessionsController {
  constructor(private sessions: AcademicSessionsService) {}

  @Get() findAll(@Query('collegeId') collegeId?: string) { return this.sessions.findAll(collegeId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.sessions.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  create(@Body() dto: CreateAcademicSessionDto) { return this.sessions.create(dto); }

  @Post(':id/holidays')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN)
  addHoliday(@Param('id') id: string, @Body() body: { date: string; name: string }) {
    return this.sessions.addHoliday(id, body.date, body.name);
  }
}
