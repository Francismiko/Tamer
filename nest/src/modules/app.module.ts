import { Module } from "@nestjs/common";
import { PrismaModule, loggingMiddleware } from "nestjs-prisma";
import { ChatModule } from "./chat/chat.module";
import { ChatModelModule } from "./chatModel/chatModel.module";
import { MessageModule } from "./message/message.module";

@Module({
	imports: [
		ChatModule,
		ChatModelModule,
		MessageModule,
		PrismaModule.forRoot({
			isGlobal: true,
			prismaServiceOptions: {
				middlewares: [loggingMiddleware()],
			},
		}),
	],
})
export class AppModule {}
