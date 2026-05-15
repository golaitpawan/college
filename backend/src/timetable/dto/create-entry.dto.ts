import { IsString, IsInt, Min, Max, IsOptional, IsEnum, Matches } from 'class-validator';
import { EntryType } from '@prisma/client';

export class CreateEntryDto {
  @IsString() subjectId: string;
  @IsString() teacherId: string;
  @IsString() classroomId: string;
  @IsInt() @Min(1) @Max(7) dayOfWeek: number;

  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @IsOptional() @IsEnum(EntryType) entryType?: EntryType;
  @IsOptional() @IsString() substituteTeacherId?: string;
}
