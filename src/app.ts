import { Receiver } from "@slack/bolt";

require("dotenv").config();

import { ChatBot } from "./types";

export const createApp = (appConfig: {
  slackBotToken: string;
  slackSigningSecret: string;
  receiver: Receiver | undefined;
}): ChatBot =>
  new ChatBot({
    token: appConfig.slackBotToken,
    signingSecret: appConfig.slackSigningSecret,
    receiver: appConfig.receiver,
  });
