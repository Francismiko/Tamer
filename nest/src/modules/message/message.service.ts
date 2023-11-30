import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseChatModel } from 'langchain/dist/chat_models/base';
import { IterableReadableStream } from 'langchain/dist/util/stream';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { ChatPromptTemplate } from 'langchain/prompts';
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

  async useChatModel(chatId: string): Promise<BaseChatModel> {
    const chatModel = await this.prisma.chatModel.findUnique({
      where: { chat_id: chatId },
      select: { model: true },
    });

    return new ChatOpenAI(
      {
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: chatModel?.model,
        temperature: 0.5,
        timeout: 5 * 1000,
        streaming: true,
      },
      {
        baseURL: process.env.OPENAI_API_PROXY_URL,
      },
    );
  }

  async generateModelStream(
    chatModel: BaseChatModel,
    message: string,
  ): Promise<IterableReadableStream<Uint8Array>> {
    const parser = new HttpResponseOutputParser();

    const systemTemplate = `
    你是一名来自中国的英语老师,擅长帮助学生准备大学英语四级、六级、雅思、托福等各类英语考试;
    使用例句帮助学生强化记忆词汇,根据现有考试格式生成新的试题,并提供正确答案;
    <所有的回答和交流用中文,题目用英文生成>
    用户的英语水平:{level};
    `;
    const humanTemplate = '{text}';

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemTemplate],
      ['human', humanTemplate],
    ]);

    const formattedChatPrompt = await chatPrompt.formatMessages({
      level: 'CET-6',
      text: message,
    });

    const stream = await chatModel.pipe(parser).stream(formattedChatPrompt);

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
