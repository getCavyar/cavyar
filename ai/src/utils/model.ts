import { OpenAI } from "langchain";
import { APIRateLimit } from "../utils/api_rate_limit";

const rateLimit = new APIRateLimit(25);

export const callLLM = async (prompt: string): Promise<string> => {
  return rateLimit.callApi(() =>
    new OpenAI({
      openAIApiKey: "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",
    }).call(prompt)
  );
};
