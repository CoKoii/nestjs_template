import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "@langchain/openai";
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

  async chat(message: string) {
    try {
      const response = await this.chatModel.invoke([
        {
          role: "system",
          content: "你是一个简洁、准确的 AI 助手。",
        },
        {
          role: "user",
          content: message,
        },
      ]);

      return {
        content:
          typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content),
      };
    } catch {
      throw new BadGatewayException("AI 服务请求失败");
    }
  }
}
