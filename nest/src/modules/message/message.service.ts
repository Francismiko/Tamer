import { Injectable } from '@nestjs/common';
import type { Message } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import type { BaseChatModel } from 'langchain/dist/chat_models/base';
import type { IterableReadableStream } from 'langchain/dist/util/stream';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { ChatPromptTemplate } from 'langchain/prompts';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  private systemTemplate: string = `
  你是一名私人英语教练,擅长帮助学生准备大学英语四级、六级、雅思、托福等各类英语考试.
  你的职责是:帮助学生学习英语,帮助学生强化记忆词汇和语法,为学生答疑解惑,给出详细的指导方案.
  要求:尽可能确保内容正确有效,逻辑清晰,并且具备随机多样性.
  注意:除了题目是英文之外,所有的回答和交流用中文,保证用户的阅读体验.
  学生的英语水平:{level}.`;

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

  async useChatModel(chatId: string): Promise<BaseChatModel> {
    const chatModel = await this.prisma.chatModel.findUnique({
      where: { chat_id: chatId },
      select: { model: true },
    });

    return new ChatOpenAI(
      {
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: chatModel?.model,
        temperature: 1,
        timeout: 5 * 1000,
        streaming: true,
      },
      {
        baseURL: process.env.OPENAI_API_PROXY_URL,
      },
    );
  }

  async generateStream(
    chatModel: BaseChatModel,
    message: string,
  ): Promise<IterableReadableStream<Uint8Array>> {
    const httpParser = new HttpResponseOutputParser();

    const chain = ChatPromptTemplate.fromMessages([
      ['system', this.systemTemplate],
      ['human', message],
    ])
      .pipe(chatModel)
      .pipe(httpParser);

    const stream = await chain.stream({ level: 'CET-6' });

    return stream;
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
