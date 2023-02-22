require("dotenv").config();

// https://github.com/apideck-libraries/node-sdk/tree/main/src/gen/models
// https://raw.githubusercontent.com/apideck-libraries/openapi-specs/master/crm.yml
// translate yml to json
// minify json
import callOpenAI from "@/lib/openai";
import fs from "fs";

let spec: string = "";
const loadSpec = () => {
  // if i fine tune it will help out a lot.
  if (!spec) {
    spec = fs.readFileSync("./dist/scripts/api-gen-prompt.txt", {
      encoding: "utf8",
    });
  }
  return spec;
};

export async function tweet(message: string) {
  console.log("generating api", message);
  const prompt = spec + "\n" + message;
  const chatGPTResponse = await callOpenAI(
    prompt,
    "internal",
    "text-davinci-003"
  ); // //'code-cushman-001'); //'
  console.log("chatGPTResponse", chatGPTResponse);

  return chatGPTResponse;
}

tweet("What brand of pen and notebook do you use?” https://t.co/NfN599DpG3");
