import { Configuration, OpenAIApi } from "openai";
import config from "../system/config";

// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing Environment Variable OPENAI_API_KEY");
}

export default async function callOpenAI(
  prompt: string,
  userId: string,
  model?: string | undefined
) {
  const payload = {
    model: model || "text-davinci-003",
    prompt: prompt,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.3,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 400,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    //    stop: [`${botName}:`, `${userName}:`],
    user: userId,
  };

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.openai.apiKey}`,
  };

  if (process.env.OPENAI_API_ORG) {
    requestHeaders["OpenAI-Organization"] = process.env.OPENAI_API_ORG;
  }
  const configuration = new Configuration({
    apiKey: config.openai.apiKey,
  });
  const openai = new OpenAIApi(configuration);
  try {
    const response = await openai.createCompletion(payload);
    const data = response.data;
    if (!data.choices[0].text) {
      throw "unable to process data";
    }
    return data.choices[0].text;
  } catch (e) {
    console.error("OpenAI API error: ", e);
    throw e;
  }
}
