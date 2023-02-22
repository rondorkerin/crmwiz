const config = {
  app: {
    baseUrl: process.env.BASE_URL as string,
    port: (process.env.PORT as string) || "3000",
  },
  mongo: {
    uri: (process.env.MONGODB_URI as string) || "mongodb://localhost:27017",
  },
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET || "", // this will be different per environment for bot
    botToken: process.env.SLACK_BOT_TOKEN || "", // this shouldnt be an env variable - varies per install.
    // Refer to: https://api.slack.com/authentication/oauth-v2
    webhookToken: process.env.WEBHOOK_TOKEN || "",
    webhookChannel: process.env.SLACK_WEBHOOK_CHANNEL || "#random",
  },
  apideck: {
    apiKey: process.env.APIDECK_API_KEY || "",
    appId: process.env.APIDECK_APP_ID || "",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
};

export default config;
