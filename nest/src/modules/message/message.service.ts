import { createGPTChatModel } from '@lib/chatModel';
import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { IterableReadableStream } from 'langchain/dist/util/stream';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { HumanMessage } from 'langchain/schema';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  getMessage(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }

  getMessagesByChatId(chat_id: string): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { chat_id },
      orderBy: { create_at: 'asc' },
    });
  }

  async generateModelStream(
    message: string,
  ): Promise<IterableReadableStream<Uint8Array>> {
    const chatModel = createGPTChatModel();
    const parser = new HttpResponseOutputParser({
      contentType: 'text/event-stream',
    });

    const stream = await chatModel
      .pipe(parser)
      .stream([new HumanMessage(message)]);

    return stream;
  }

  streamDecode(chunks: Uint8Array[]): string {
    return chunks
      .map((chunk) =>
        new TextDecoder()
          .decode(chunk, { stream: true })
          .split('\n\n')
          .map((line) => line.trim().split('\n')[1]?.slice(6))
          .join(''),
      )
      .join('');
  }

  async createChatMessages({
    humanMessage,
    AIMessage,
    chatId,
  }: {
    humanMessage: string;
    AIMessage: string;
    chatId: string;
  }): Promise<void> {
    await this.prisma.message.create({
      data: {
        content: humanMessage,
        sender: 'Human',
        status: 'Done',
        chat_id: chatId,
      },
    });

    await this.prisma.message.create({
      data: {
        content: AIMessage,
        sender: 'AI',
        status: 'Done',
        chat_id: chatId,
      },
    });
  }
}
