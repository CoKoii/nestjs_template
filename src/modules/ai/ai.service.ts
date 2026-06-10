import { ChatOpenAI } from "@langchain/openai";
import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Readable } from "node:stream";
import { getAiEnvironment } from "../../common/config/env";

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

  // --------------------------------------------------------------------------------------------------
  // 发起普通对话
  async chat(message: string) {
    try {
      const response = await this.chatModel.invoke([
        ["system", "你是一个简洁、准确的 AI 助手。"],
        ["human", message],
      ]);

      return {
        content: response.text,
      };
    } catch {
      throw new BadGatewayException("AI 服务请求失败");
    }
  }
  // --------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------
  // 创建流式对话响应
  createChatSseStream(message: string): Readable {
    const chatModel = this.chatModel;

    return Readable.from(
      (async function* (): AsyncGenerator<string> {
        try {
          const stream = await chatModel.stream([
            ["system", "你是一个简洁、准确的 AI 助手。"],
            ["human", message],
          ]);
          for await (const chunk of stream) {
            if (chunk.text) {
              yield `data: ${JSON.stringify({ content: chunk.text })}\n\n`;
            }
          }
          yield "data: [DONE]\n\n";
        } catch {
          yield `event: error\ndata: ${JSON.stringify({ message: "AI 服务请求失败" })}\n\n`;
        }
      })(),
    );
  }
  // --------------------------------------------------------------------------------------------------
}
