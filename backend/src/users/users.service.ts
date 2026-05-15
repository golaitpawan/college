import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { role?: string; departmentId?: string }) {
    return this.prisma.user.findMany({
      where: {
        userRoles: query.role
          ? { some: { role: { name: query.role as any } } }
          : undefined,
      },
      include: { userRoles: { include: { role: true, department: true } } },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true, department: true } },
        teacherProfile: true,
        studentProfile: { include: { section: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role
      ? await this.prisma.role.findUnique({ where: { name: dto.role } })
      : null;

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        userRoles: role
          ? { create: { roleId: role.id, departmentId: dto.departmentId } }
          : undefined,
      },
      include: { userRoles: { include: { role: true } } },
    });
  }

  async assignRole(userId: string, roleId: string, departmentId?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.userRole.findFirst({
      where: { userId, roleId, departmentId: departmentId ?? null },
    });
    if (existing) return existing;
    return this.prisma.userRole.create({ data: { userId, roleId, departmentId } });
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    return this.prisma.user.update({ where: { id }, data: { status } });
  }
}
