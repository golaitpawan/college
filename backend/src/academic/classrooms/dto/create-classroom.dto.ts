import { IsString, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ClassroomType } from '@prisma/client';

export class CreateClassroomDto {
  @IsString() collegeId: string;
  @IsString() name: string;
  @IsInt() @Min(1) capacity: number;
  @IsOptional() @IsEnum(ClassroomType) type?: ClassroomType;
}
