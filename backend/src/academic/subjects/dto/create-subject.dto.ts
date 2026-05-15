import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { SubjectType } from '@prisma/client';

export class CreateSubjectDto {
  @IsString() courseId: string;
  @IsString() name: string;
  @IsString() code: string;
  @IsInt() @Min(1) semester: number;
  @IsOptional() @IsInt() @Min(1) credits?: number;
  @IsOptional() @IsInt() @Min(1) weeklyHours?: number;
  @IsOptional() @IsEnum(SubjectType) type?: SubjectType;
}
