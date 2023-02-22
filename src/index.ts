require("dotenv").config();

import { createApp } from "./app";
import { addEvents } from "./events";
import { createHandler, addHttpHandlers } from "./http";
import config from "@/system/config";
import bootMongo from "@/system/mongoose";

bootMongo();

const receiver = createHandler({
  signingSecret: config.slack.signingSecret,
});

const app = createApp({
  slackBotToken: config.slack.botToken,
  slackSigningSecret: config.slack.signingSecret,
  receiver,
});

addEvents(app);
addHttpHandlers({
  app,
  receiver,
  allowedTokens: [config.slack.webhookToken],
  dmChannel: config.slack.webhookChannel,
});

(async () => {
  await app.start(config.app.port);
  console.log(`⚡️ Bolt app is listening at localhost:${config.app.port}`);
})();
