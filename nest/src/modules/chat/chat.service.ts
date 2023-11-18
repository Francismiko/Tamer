import { Injectable } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  getChat(id: string): Promise<Chat | null> {
    return this.prisma.chat.findUnique({
      where: {
        id,
      },
    });
  }

  getChatsByOwner(owner: string): Promise<Chat[]> {
    return this.prisma.chat.findMany({
      where: {
        owner,
      },
      orderBy: {
        create_at: 'desc',
      },
    });
  }

  createChat({
    owner,
    title,
    chatModel,
  }: {
    owner: string;
    title: string;
    chatModel: string;
  }): Promise<Chat> {
    return this.prisma.chat.create({
      data: {
        owner,
        title,
        chat_model: chatModel,
      },
    });
  }
}
