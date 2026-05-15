import { IsString } from 'class-validator';

export class CreateTimetableDto {
  @IsString() departmentId: string;
  @IsString() academicSessionId: string;
  @IsString() sectionId: string;
}
