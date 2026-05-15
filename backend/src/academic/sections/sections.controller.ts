import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('sections')
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private sections: SectionsService) {}

  @Get() findAll(@Query('courseId') courseId?: string, @Query('sessionId') sessionId?: string) {
    return this.sections.findAll(courseId, sessionId);
  }
  @Get(':id') findOne(@Param('id') id: string) { return this.sections.findOne(id); }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  create(@Body() dto: CreateSectionDto) { return this.sections.create(dto); }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.COLLEGE_ADMIN, RoleName.DEPT_HEAD)
  update(@Param('id') id: string, @Body() dto: Partial<CreateSectionDto>) { return this.sections.update(id, dto); }
}
