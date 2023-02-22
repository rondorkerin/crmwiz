class InternalMailchimp {
  private client: any;

  constructor(apiKey: string, serverPrefix: string) {
    const { Client } = require("@mailchimp/mailchimp_marketing");
    this.client = new Client();
    this.client.setConfig({
      apiKey,
      server: serverPrefix,
    });
  }

  async addContact(contact: {
    email: string;
    firstName: string;
    lastName: string;
  }) {
    const params = () => [
      {
        internalName: "email",
        formattedName: "Email Address",
        type: "string",
        required: true,
      },
      {
        internalName: "firstName",
        formattedName: "First Name",
        type: "string",
        required: true,
      },
      {
        internalName: "lastName",
        formattedName: "Last Name",
        type: "string",
        required: true,
      },
    ];

    const returnValues = () => [
      { internalName: "result", formattedName: "Result", type: "string" },
    ];

    const call = async (params: any) => {
      const { email, firstName, lastName } = params;

      if (!email || !firstName || !lastName) {
        throw new APICallError({
          naturalLanguageDescription:
            "Please provide a valid email, first name, and last name.",
          type: "param",
          canUserFix: true,
          userFixRequirements:
            "Please provide a valid email, first name, and last name.",
        });
      }

      const subscriber = {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      };

      try {
        const result = await this.client.lists.addListMember(
          "YOUR_LIST_ID",
          subscriber
        );
        return { result };
      } catch (error) {
        throw new APICallError({
          // @ts-ignore
          naturalLanguageDescription: `Failed to add contact to Mailchimp: ${error.message}`,
          type: "system",
          canUserFix: false,
        });
      }
    };

    return { params, returnValues, call };
  }

  async createList(list: {
    name: string;
    contact: {
      company: string;
      address1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    permissionReminder: string;
    campaignDefaults: {
      fromName: string;
      fromEmail: string;
      subject: string;
      language: string;
    };
    emailTypeOption: boolean[];
  }) {
    const params = () => [
      {
        internalName: "name",
        formattedName: "List Name",
        type: "string",
        required: true,
      },
      {
        internalName: "contact",
        formattedName: "Contact Information",
        type: "object",
        required: true,
        description:
          "An object containing the contact information for the list.",
      },
      {
        internalName: "permissionReminder",
        formattedName: "Permission Reminder",
        type: "string",
        required: true,
      },
      {
        internalName: "campaignDefaults",
        formattedName: "Default Campaign Settings",
        type: "object",
        required: true,
        description:
          "An object containing the default settings for campaigns sent to the list.",
      },
      {
        internalName: "emailTypeOption",
        formattedName: "Email Type Option",
        type: "boolean",
        required: true,
      },
    ];

    const returnValues = () => [
      { internalName: "result", formattedName: "Result", type: "string" },
    ];

    const call = async (params: any) => {
      const {
        name,
        contact,
        permissionReminder,
        campaignDefaults,
        emailTypeOption,
      } = params;

      if (
        !name ||
        !contact ||
        !permissionReminder ||
        !campaignDefaults ||
        !emailTypeOption
      ) {
        throw new APICallError({
          naturalLanguageDescription:
            "Please provide a valid name, contact information, permission reminder, default campaign settings, and email type option.",
          type: "param",
          canUserFix: true,
          userFixRequirements:
            "Please provide a valid name, contact information, permission reminder, default campaign settings, and email type option.",
        });
      }

      try {
        const result = await this.client.lists.create({
          name,
          contact,
          permission_reminder: permissionReminder,
          campaign_defaults: campaignDefaults,
          email_type_option: emailTypeOption,
        });
        return { result };
      } catch (error) {
        throw new APICallError({
          // @ts-ignore
          naturalLanguageDescription: `Failed to create list in Mailchimp: ${error.message}`,
          type: "system",
          canUserFix: false,
        });
      }
    };

    return { params, returnValues, call };
  }
}

function authenticationRequirements() {
  return {
    authenticationType: "apikey",
    authenticationParameters: [
      {
        internalName: "apiKey",
        formattedName: "API Key",
        type: "string",
        required: true,
      },
      {
        internalName: "serverPrefix",
        formattedName: "Server Prefix",
        type: "string",
        required: true,
      },
    ],
    askUserForAuthParams:
      "Please provide your Mailchimp API key and server prefix.",
  };
}

class APICallError extends Error {
  naturalLanguageDescription: string;
  type: "system" | "param" | string;
  canUserFix: boolean;
  userFixRequirements: string;

  constructor({
    naturalLanguageDescription,
    type,
    canUserFix,
    userFixRequirements,
  }: any) {
    super(naturalLanguageDescription);
    this.naturalLanguageDescription = naturalLanguageDescription;
    this.type = type;
    this.canUserFix = canUserFix;
    this.userFixRequirements = userFixRequirements;
  }
}

export { InternalMailchimp, authenticationRequirements };
