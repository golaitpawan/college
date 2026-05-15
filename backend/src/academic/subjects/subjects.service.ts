import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  findAll(courseId?: string) {
    return this.prisma.subject.findMany({
      where: courseId ? { courseId } : undefined,
      include: { course: { include: { department: true } } },
      orderBy: [{ semester: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id }, include: { course: true } });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  create(dto: CreateSubjectDto) { return this.prisma.subject.create({ data: dto }); }

  async update(id: string, data: Partial<CreateSubjectDto>) {
    await this.findOne(id);
    return this.prisma.subject.update({ where: { id }, data });
  }
}
