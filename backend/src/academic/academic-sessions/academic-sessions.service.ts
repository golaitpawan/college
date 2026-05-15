import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAcademicSessionDto } from './dto/create-academic-session.dto';

@Injectable()
export class AcademicSessionsService {
  constructor(private prisma: PrismaService) {}

  findAll(collegeId?: string) {
    return this.prisma.academicSession.findMany({
      where: collegeId ? { collegeId } : undefined,
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.academicSession.findUnique({
      where: { id },
      include: { holidays: true },
    });
    if (!session) throw new NotFoundException('Academic session not found');
    return session;
  }

  create(dto: CreateAcademicSessionDto) {
    return this.prisma.academicSession.create({
      data: { ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
  }

  async addHoliday(sessionId: string, date: string, name: string) {
    return this.prisma.holiday.create({
      data: { academicSessionId: sessionId, date: new Date(date), name },
    });
  }
}
