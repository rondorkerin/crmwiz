import { ChatBot } from "../types";
import { generalCrmEvent } from "@/events/crm-events/general";
import { crmConnectEvent } from "@/events/crm-events/connect";
import { getUserFromSlackEvent } from "@/models/User";

const addNaturalLanguageHandler = (app: ChatBot) => {
  // TODO: need a less hacky intent machine
  app.event("app_mention", async ({ event, client, logger }) => {
    try {
      if (!event.user) {
        logger.error("No user in slack event", event);
        throw "No user in slack event.";
      }
      let responseText;
      const eventText = event.text.toLowerCase();
      if (eventText.includes("crm-connect") || eventText.includes("login")) {
        responseText = await crmConnectEvent(event, client, eventText);
      } else if (
        eventText.includes("opportunity") ||
        eventText.includes("opp") ||
        eventText.includes("contact") ||
        eventText.includes("lead") ||
        eventText.includes("company")
      ) {
        const user = await getUserFromSlackEvent(event.user, event.team);
        if (!user) {
          responseText = 'try typing "login" to set up a crm.';
        } else {
          responseText = await generalCrmEvent("hubspot", eventText, user);
        }
      } else {
        responseText = `try typing "login" if it's your first time setting up a CRM.`;
      }
      // Call chat.postMessage with the built-in client
      const result = await client.chat.postMessage({
        channel: event.channel,
        text: responseText,
      });
      logger.info(result);
    } catch (error: any) {
      logger.error(error);
      const result = await client.chat.postMessage({
        channel: event.channel,
        text: `Sorry, had an error. ${(error as Error)?.message}`,
      });
    }
  });
};

export const addEvents = (app: ChatBot) => {
  addNaturalLanguageHandler(app);
};
