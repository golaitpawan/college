import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAcademicSessionDto {
  @IsString() collegeId: string;
  @IsString() name: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
