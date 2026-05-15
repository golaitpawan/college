import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConflictResult {
  type: string;
  message: string;
  entryId?: string;
}

function overlaps(s1: string, e1: string, s2: string, e2: string): boolean {
  return s1 < e2 && e1 > s2;
}

@Injectable()
export class ConflictService {
  constructor(private prisma: PrismaService) {}

  async validate(timetableVersionId: string): Promise<ConflictResult[]> {
    const entries = await this.prisma.timetableEntry.findMany({
      where: { timetableVersionId },
      include: {
        teacher: { select: { fullName: true } },
        classroom: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    const conflicts: ConflictResult[] = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i];
        const b = entries[j];

        if (a.dayOfWeek !== b.dayOfWeek) continue;
        if (!overlaps(a.startTime, a.endTime, b.startTime, b.endTime)) continue;

        if (a.teacherId === b.teacherId) {
          conflicts.push({
            type: 'TEACHER_DOUBLE_BOOK',
            message: `${a.teacher.fullName} is scheduled twice on day ${a.dayOfWeek} at ${a.startTime}–${a.endTime}`,
            entryId: b.id,
          });
        }

        if (a.classroomId === b.classroomId) {
          conflicts.push({
            type: 'ROOM_DOUBLE_BOOK',
            message: `${a.classroom.name} is booked twice on day ${a.dayOfWeek} at ${a.startTime}–${a.endTime}`,
            entryId: b.id,
          });
        }
      }
    }

    // Teacher workload check
    const teacherHours: Record<string, number> = {};
    for (const entry of entries) {
      const [sh, sm] = entry.startTime.split(':').map(Number);
      const [eh, em] = entry.endTime.split(':').map(Number);
      const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
      teacherHours[entry.teacherId] = (teacherHours[entry.teacherId] || 0) + hours;
    }

    const teacherIds = Object.keys(teacherHours);
    if (teacherIds.length > 0) {
      const profiles = await this.prisma.teacherProfile.findMany({
        where: { userId: { in: teacherIds } },
        include: { user: { select: { fullName: true } } },
      });

      for (const profile of profiles) {
        const total = teacherHours[profile.userId] || 0;
        if (total > profile.maxWeeklyHours) {
          conflicts.push({
            type: 'WORKLOAD_EXCEEDED',
            message: `${profile.user.fullName} has ${total.toFixed(1)}h/week, exceeding limit of ${profile.maxWeeklyHours}h`,
          });
        }
      }
    }

    // Holiday check
    const version = await this.prisma.timetableVersion.findUnique({
      where: { id: timetableVersionId },
      include: { academicSession: { include: { holidays: true } } },
    });

    if (version) {
      const holidayDays = new Set(
        version.academicSession.holidays.map((h) => new Date(h.date).getDay() || 7),
      );
      for (const entry of entries) {
        if (holidayDays.has(entry.dayOfWeek)) {
          conflicts.push({
            type: 'HOLIDAY_CONFLICT',
            message: `Entry on day ${entry.dayOfWeek} falls on a holiday`,
            entryId: entry.id,
          });
        }
      }
    }

    return conflicts;
  }
}
