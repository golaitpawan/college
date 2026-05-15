import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  findAll(courseId?: string, sessionId?: string) {
    return this.prisma.section.findMany({
      where: {
        ...(courseId && { courseId }),
        ...(sessionId && { academicSessionId: sessionId }),
      },
      include: { course: true, academicSession: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { course: true, academicSession: true, studentProfiles: { include: { user: true } } },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  create(dto: CreateSectionDto) { return this.prisma.section.create({ data: dto }); }

  async update(id: string, data: Partial<CreateSectionDto>) {
    await this.findOne(id);
    return this.prisma.section.update({ where: { id }, data });
  }
}
