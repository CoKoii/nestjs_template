import type { BaseMessageLike } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Readable } from "node:stream";
import { getAiEnvironment } from "../../common/config/env";

const SYSTEM_PROMPT = "你是一个简洁、准确的 AI 助手。";

@Injectable()
export class AiService {
  private readonly chatModel: ChatOpenAI;

  constructor(configService: ConfigService) {
    const aiEnvironment = getAiEnvironment(configService);

    this.chatModel = new ChatOpenAI({
      apiKey: aiEnvironment.apiKey,
      model: aiEnvironment.chatModel,
      temperature: aiEnvironment.temperature,
      configuration: aiEnvironment.baseUrl
        ? { baseURL: aiEnvironment.baseUrl }
        : undefined,
    });
  }

  async chat(message: string) {
    try {
      const response = await this.chatModel.invoke(
        this.createMessages(message),
      );

      return {
        content: response.text,
      };
    } catch {
      throw new BadGatewayException("AI 服务请求失败");
    }
  }

  createChatSseStream(message: string): Readable {
    return Readable.from(this.streamSseMessages(message));
  }

  private async *streamSseMessages(message: string): AsyncGenerator<string> {
    try {
      const stream = await this.chatModel.stream(this.createMessages(message));

      for await (const chunk of stream) {
        if (chunk.text) {
          yield `data: ${JSON.stringify({ content: chunk.text })}\n\n`;
        }
      }

      yield "data: [DONE]\n\n";
    } catch {
      yield `event: error\ndata: ${JSON.stringify({ message: "AI 服务请求失败" })}\n\n`;
    }
  }

  private createMessages(message: string): BaseMessageLike[] {
    return [
      ["system", SYSTEM_PROMPT],
      ["human", message],
    ];
  }
}
