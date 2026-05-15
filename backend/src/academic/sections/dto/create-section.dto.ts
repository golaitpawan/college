import { IsString, IsInt, Min } from 'class-validator';

export class CreateSectionDto {
  @IsString() courseId: string;
  @IsString() academicSessionId: string;
  @IsInt() @Min(1) semester: number;
  @IsString() name: string;
}
