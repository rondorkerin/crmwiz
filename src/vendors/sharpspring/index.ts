class InternalSharpSpring {
  private client: any;

  constructor(accountId: string, secretKey: string) {
    this.client = require("sharpspring")({
      accountId,
      secretKey,
    });
  }

  async createLead(lead: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    const params = () => [
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
      {
        internalName: "email",
        formattedName: "Email Address",
        type: "string",
        required: true,
      },
    ];

    const returnValues = () => [
      { internalName: "result", formattedName: "Result", type: "object" },
    ];

    const call = async (params: any) => {
      const { firstName, lastName, email } = params;

      if (!firstName || !lastName || !email) {
        throw new APICallError({
          naturalLanguageDescription:
            "Please provide a valid first name, last name, and email address.",
          type: "param",
          canUserFix: true,
          userFixRequirements:
            "Please provide a valid first name, last name, and email address.",
        });
      }

      try {
        const result = await this.client.post("Leads", {
          firstName,
          lastName,
          emailAddress: email,
        });
        return { result };
      } catch (error) {
        throw new APICallError({
          // @ts-ignore
          naturalLanguageDescription: `Failed to create lead in SharpSpring: ${error.message}`,
          type: "system",
          canUserFix: false,
        });
      }
    };

    return { params, returnValues, call };
  }

  async createOpportunity(opportunity: {
    name: string;
    value: number;
    accountId: number;
    assignedTo: number;
  }) {
    const params = () => [
      {
        internalName: "name",
        formattedName: "Opportunity Name",
        type: "string",
        required: true,
      },
      {
        internalName: "value",
        formattedName: "Opportunity Value",
        type: "number",
        required: true,
      },
      {
        internalName: "accountId",
        formattedName: "Account ID",
        type: "number",
        required: true,
      },
      {
        internalName: "assignedTo",
        formattedName: "Assigned To",
        type: "number",
        required: true,
      },
    ];

    const returnValues = () => [
      { internalName: "result", formattedName: "Result", type: "object" },
    ];

    const call = async (params: any) => {
      const { name, value, accountId, assignedTo } = params;

      if (!name || !value || !accountId || !assignedTo) {
        throw new APICallError({
          naturalLanguageDescription:
            "Please provide a valid opportunity name, value, account ID, and assigned to user ID.",
          type: "param",
          canUserFix: true,
          userFixRequirements:
            "Please provide a valid opportunity name, value, account ID, and assigned to user ID.",
        });
      }

      try {
        const result = await this.client.post("Opportunities", {
          name,
          value,
          accountId,
          assignedTo,
        });
        return { result };
      } catch (error) {
        throw new APICallError({
          // @ts-ignore
          naturalLanguageDescription: `Failed to create opportunity in SharpSpring: ${error.message}`,
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
    authenticationType: "secretkey",
    authenticationParameters: [
      {
        internalName: "accountId",
        formattedName: "Account ID",
        type: "string",
        required: true,
      },
      {
        internalName: "secretKey",
        formattedName: "Secret Key",
        type: "string",
        required: true,
      },
    ],
    askUserForAuthParams:
      "Please provide your SharpSpring account ID and secret key.",
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

export { InternalSharpSpring, authenticationRequirements };
