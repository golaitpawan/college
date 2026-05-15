import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface SendNotificationDto {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private gateway: any;

  constructor(private prisma: PrismaService) {}

  setGateway(gateway: any) { this.gateway = gateway; }

  async send(userId: string, dto: SendNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: { userId, ...dto, deliveredAt: new Date() },
    });

    this.gateway?.sendToUser(userId, notification);
    return notification;
  }

  async sendToMany(userIds: string[], dto: SendNotificationDto) {
    await Promise.all(userIds.map((id) => this.send(id, dto)));
  }

  async findAll(userId: string, unread?: boolean) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unread && { readAt: null }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }
}
