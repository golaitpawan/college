import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments/departments.controller';
import { DepartmentsService } from './departments/departments.service';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { SubjectsController } from './subjects/subjects.controller';
import { SubjectsService } from './subjects/subjects.service';
import { ClassroomsController } from './classrooms/classrooms.controller';
import { ClassroomsService } from './classrooms/classrooms.service';
import { SectionsController } from './sections/sections.controller';
import { SectionsService } from './sections/sections.service';
import { AcademicSessionsController } from './academic-sessions/academic-sessions.controller';
import { AcademicSessionsService } from './academic-sessions/academic-sessions.service';

@Module({
  controllers: [
    DepartmentsController,
    CoursesController,
    SubjectsController,
    ClassroomsController,
    SectionsController,
    AcademicSessionsController,
  ],
  providers: [
    DepartmentsService,
    CoursesService,
    SubjectsService,
    ClassroomsService,
    SectionsService,
    AcademicSessionsService,
  ],
})
export class AcademicModule {}
