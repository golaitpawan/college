import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TimetableStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictService } from './conflict.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { CreateEntryDto } from './dto/create-entry.dto';

const EDITABLE_STATUSES: TimetableStatus[] = ['DRAFT', 'CHANGES_REQUESTED'];

@Injectable()
export class TimetableService {
  constructor(
    private prisma: PrismaService,
    private conflicts: ConflictService,
    private notifications: NotificationsService,
  ) {}

  async findAll(sectionId?: string, departmentId?: string, status?: string) {
    return this.prisma.timetableVersion.findMany({
      where: {
        ...(sectionId && { sectionId }),
        ...(departmentId && { departmentId }),
        ...(status && { status: status as TimetableStatus }),
      },
      include: {
        section: { include: { course: true } },
        department: true,
        academicSession: true,
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const version = await this.prisma.timetableVersion.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            subject: true,
            teacher: { select: { id: true, fullName: true, email: true } },
            classroom: true,
            substituteTeacher: { select: { id: true, fullName: true } },
          },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
        section: { include: { course: { include: { department: true } } } },
        department: true,
        academicSession: true,
        approvals: { include: { actor: { select: { fullName: true } } }, orderBy: { actedAt: 'desc' } },
        createdBy: { select: { fullName: true } },
      },
    });
    if (!version) throw new NotFoundException('Timetable version not found');
    return version;
  }

  async findForStudent(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile?.sectionId) return null;

    return this.prisma.timetableVersion.findFirst({
      where: { sectionId: profile.sectionId, status: 'PUBLISHED' },
      include: {
        entries: {
          include: { subject: true, teacher: { select: { fullName: true } }, classroom: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async findForTeacher(userId: string) {
    return this.prisma.timetableEntry.findMany({
      where: {
        OR: [{ teacherId: userId }, { substituteTeacherId: userId }],
        timetableVersion: { status: 'PUBLISHED' },
      },
      include: {
        subject: true,
        classroom: true,
        timetableVersion: {
          include: { section: { include: { course: true } } },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(dto: CreateTimetableDto, userId: string) {
    const last = await this.prisma.timetableVersion.findFirst({
      where: { sectionId: dto.sectionId, academicSessionId: dto.academicSessionId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (last?.versionNumber ?? 0) + 1;

    return this.prisma.timetableVersion.create({
      data: { ...dto, versionNumber, createdById: userId },
    });
  }

  async addEntry(versionId: string, dto: CreateEntryDto) {
    const version = await this.findOne(versionId);
    if (!EDITABLE_STATUSES.includes(version.status)) {
      throw new BadRequestException(`Cannot edit timetable in ${version.status} status`);
    }
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    return this.prisma.timetableEntry.create({
      data: { timetableVersionId: versionId, ...dto },
      include: { subject: true, teacher: { select: { fullName: true } }, classroom: true },
    });
  }

  async removeEntry(versionId: string, entryId: string) {
    const version = await this.findOne(versionId);
    if (!EDITABLE_STATUSES.includes(version.status)) {
      throw new BadRequestException(`Cannot edit timetable in ${version.status} status`);
    }
    return this.prisma.timetableEntry.delete({ where: { id: entryId } });
  }

  async validate(versionId: string) {
    await this.findOne(versionId);
    return this.conflicts.validate(versionId);
  }

  async submit(versionId: string, userId: string) {
    const version = await this.findOne(versionId);
    if (version.status !== 'DRAFT' && version.status !== 'CHANGES_REQUESTED') {
      throw new BadRequestException('Only draft or changes-requested timetables can be submitted');
    }

    const conflictList = await this.conflicts.validate(versionId);
    if (conflictList.length > 0) {
      throw new BadRequestException({ message: 'Resolve conflicts before submitting', conflicts: conflictList });
    }

    return this.updateStatus(versionId, 'SUBMITTED', userId);
  }

  async approve(versionId: string, userId: string, comment?: string) {
    const version = await this.findOne(versionId);
    if (version.status !== 'SUBMITTED') throw new BadRequestException('Only submitted timetables can be approved');
    return this.updateStatus(versionId, 'APPROVED', userId, comment);
  }

  async requestChanges(versionId: string, userId: string, comment: string) {
    const version = await this.findOne(versionId);
    if (version.status !== 'SUBMITTED') throw new BadRequestException('Only submitted timetables can have changes requested');
    return this.updateStatus(versionId, 'CHANGES_REQUESTED', userId, comment);
  }

  async publish(versionId: string, userId: string) {
    const version = await this.findOne(versionId);
    if (version.status !== 'APPROVED') throw new BadRequestException('Only approved timetables can be published');

    const updated = await this.prisma.timetableVersion.update({
      where: { id: versionId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedById: userId,
      },
    });

    await this.prisma.timetableApproval.create({
      data: { timetableVersionId: versionId, action: 'PUBLISHED', actorId: userId },
    });

    // Notify all students in the section
    const students = await this.prisma.studentProfile.findMany({
      where: { sectionId: version.sectionId },
      select: { userId: true },
    });

    await this.notifications.sendToMany(
      students.map((s) => s.userId),
      {
        type: 'TIMETABLE_PUBLISHED',
        title: 'Timetable Published',
        body: `Your timetable for ${version.section?.name ?? 'your section'} has been published.`,
        data: { timetableVersionId: versionId },
      },
    );

    return updated;
  }

  private async updateStatus(versionId: string, status: TimetableStatus, userId: string, comment?: string) {
    const [updated] = await this.prisma.$transaction([
      this.prisma.timetableVersion.update({ where: { id: versionId }, data: { status } }),
      this.prisma.timetableApproval.create({
        data: { timetableVersionId: versionId, action: status, actorId: userId, comment },
      }),
    ]);
    return updated;
  }
}
