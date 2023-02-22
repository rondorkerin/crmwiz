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

export async function generateAPI(
  companyName: string,
  companyNameInternal: string
) {
  console.log("generating api", companyName);
  const prompt =
    spec +
    `\nCompanyName: ${companyName} | InternalCompanyName: ${companyNameInternal}\nReturn only 4000 tokens of data (skip 0) `;
  const chatGPTResponse = await callOpenAI(
    prompt,
    "internal",
    "code-davinci-002"
  ); // //'code-cushman-001'); //'
  console.log("chatGPTResponse", chatGPTResponse);
  fs.mkdirSync(`./src/vendors/${companyNameInternal}`);
  fs.writeFileSync(
    `./src/vendors/${companyNameInternal}/index.ts}`,
    chatGPTResponse
  );

  return chatGPTResponse;
}
const companyName = "Hubspot";
const companyNameInternal = "hubspot";
generateAPI(companyName, companyNameInternal);
