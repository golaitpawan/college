import { IsString, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @IsString() collegeId: string;
  @IsString() name: string;
  @IsString() code: string;
  @IsOptional() @IsString() headUserId?: string;
}
