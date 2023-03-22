import { AIApi, Completion, Model } from "../contracts/ai";
import { Configuration, OpenAIApi } from "openai";

export class OpenAI implements AIApi {
  api: OpenAIApi;
  constructor(apiKey: string) {
    this.api = new OpenAIApi(new Configuration({ apiKey }));
  }

  async listModels(): Promise<Model[]> {
    const { data } = await this.api.listModels()
    return data.data;
  }

  async createCompletion(model: Model, prompt: string): Promise<Completion> {
    if (!model?.id) {
      const models = await this.listModels()
      console.log(models);
      throw new Error(`Invalid Model - ${model.id}`);
    }

    const { data } = await this.api.createChatCompletion({
      model: model.id, messages: [
        {
          role: "user",
          content: prompt
        },
      ]
    })
    return {
      text: data?.choices?.[0]?.message?.content ?? ""
    }
  }

}