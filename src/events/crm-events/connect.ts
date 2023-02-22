import { createUserFromSlackProfile } from "@/models/User";
import { MessageError } from "@/errors";
import { getApiDeckForUser, createApiDeckSession } from "@/vendors/apideck";
import { WebClient } from "@slack/web-api";
import { AppMentionEvent } from "@slack/bolt";

export const crmConnectEvent = async (
  event: AppMentionEvent,
  client: WebClient,
  text: string
): Promise<string> => {
  try {
    console.log("got login request", text);
    if (!event.user) {
      throw new MessageError("No user specified");
    }
    const profileResponse = await client.users.profile.get({
      user: event.user,
    });
    const user = await createUserFromSlackProfile(
      event.user,
      event.team,
      profileResponse
    );
    console.log("made user", user);
    const apiDeck = await getApiDeckForUser(user);
    console.log("got apiDeck", apiDeck);
    const apiDeckSession = await createApiDeckSession(user, apiDeck);
    console.log("got apiDeckSession", apiDeckSession);
    return `<${apiDeckSession.session_uri}| Click here add/remove CRM connections from your account>`;
  } catch (error) {
    console.error("error in crmConnectEvent", error);
    throw error;
  }
};
