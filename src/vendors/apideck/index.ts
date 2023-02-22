import ApiDeck from "@apideck/node";
import config from "@/system/config";
import { type User } from "@/models/User";

export async function getApiDeckForUser(user: User): Promise<ApiDeck> {
  console.log("getting API deck for user", user.id!);
  const apiDeck = new ApiDeck({
    apiKey: config.apideck.apiKey,
    appId: config.apideck.appId,
    consumerId: user.id!, // consumer id is user id
  });
  return apiDeck;
}

export async function createApiDeckSession(
  user: User,
  apiDeck: ApiDeck
): Promise<any> {
  const params = {
    session: {
      consumer_metadata: {
        account_name: user.orgName,
        user_name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        image: user.avatar,
      },
      redirect_uri: config.app.baseUrl,
      settings: {
        unified_apis: ["crm"],
        hide_resource_settings: false,
        sandbox_mode: false,
        isolation_mode: false,
        session_length: "30m",
        show_logs: true,
        show_suggestions: false,
        show_sidebar: true,
        auto_redirect: false,
      },
      theme: {
        favicon: "https://res.cloudinary.com/apideck/icons/intercom",
        primary_color: "#286efa",
        sidepanel_background_color: "#286efa",
        sidepanel_text_color: "#FFFFFF",
        vault_name: "Intercom",
        privacy_url: "https://compliance.apideck.com/privacy-policy",
        terms_url:
          "https://www.termsfeed.com/terms-conditions/957c85c1b089ae9e3219c83eff65377e",
      },
    },
  };

  try {
    // @ts-ignore
    const { data } = await apiDeck.vault.sessionsCreate(params);
    console.log("API called successfully", data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
/*
async function createOpportunity(apiDeck: ApiDeck, payload: object) {
  try {
    const { data } = await apiDeck.crm.createOpportunity(payload)
    return data;
    //    console.log("API called successfully", data);
  } catch (error) {
    console.error(error);
  }
}
*/
