// https://github.com/apideck-libraries/node-sdk/tree/main/src/gen/models

// https://raw.githubusercontent.com/apideck-libraries/openapi-specs/master/crm.yml
// translate yml to json
// minify json
import callOpenAI from "@/lib/openai";
import { User } from "@/models/User";
import fs from "fs";
import { APIDeckCRMUserContext } from "./interpreter";

let spec: string = "";
const loadSpec = () => {
  // if i fine tune it will help out a lot.
  if (!spec) {
    spec = fs.readFileSync("./dist/vendors/apideck/crm/prompt.txt", {
      encoding: "utf8",
    });
  }
  return spec;
};

// TODO: will have to load the user's pipeline when making opportunities and validate deal stages / inject into the prompt
// also need to validate the user's ownerID
const apiDeckPrompt = async (
  message: string,
  apiDeckCrmUserContext: APIDeckCRMUserContext
) => {
  const prompt = await fs.promises.readFile(
    "./dist/vendors/apideck/crm/prompt.txt",
    { encoding: "utf8", flag: "r" }
  );
  return `${prompt}\nWhen a user is specifying opportunity/deal stages, you must coerce it to one of: ${apiDeckCrmUserContext.validOpportunityStages.join(
    ","
  )}
User Request: ${message}`;
};

export async function interpretNLP(
  user: User,
  apiDeckCrmUserContext: APIDeckCRMUserContext,
  message: string
) {
  const prompt = await apiDeckPrompt(message, apiDeckCrmUserContext);
  console.log("running prompt", prompt);
  const chatGPTResponse = await callOpenAI(prompt, user.id!);
  console.log("chatGPTResponse", chatGPTResponse);
  return chatGPTResponse;
}
