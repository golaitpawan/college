import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';

@Injectable()
export class ClassroomsService {
  constructor(private prisma: PrismaService) {}

  findAll(collegeId?: string, type?: string) {
    return this.prisma.classroom.findMany({
      where: {
        ...(collegeId && { collegeId }),
        ...(type && { type: type as any }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.classroom.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Classroom not found');
    return room;
  }

  create(dto: CreateClassroomDto) { return this.prisma.classroom.create({ data: dto }); }

  async update(id: string, data: Partial<CreateClassroomDto>) {
    await this.findOne(id);
    return this.prisma.classroom.update({ where: { id }, data });
  }
}
