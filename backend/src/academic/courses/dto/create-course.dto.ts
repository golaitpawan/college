import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString() departmentId: string;
  @IsString() name: string;
  @IsString() code: string;
  @IsOptional() @IsInt() @Min(1) durationYears?: number;
}
