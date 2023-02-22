import { APIDeckCRMAction, APIDeckCRMResponse } from "./interpreter";
import { getApiDeckForUser } from "@/vendors/apideck";
import { User } from "@/models/User";
import { CrmApi, CrmApiOpportunitiesAllRequest } from "@apideck/node";
import { NestedSchemaObject } from "./interpreter";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TIME_BETWEEN_API_CALLS = 100;

export async function findOperation(
  crmApi: CrmApi,
  apiDeckCrmAction: APIDeckCRMAction
): Promise<APIDeckCRMResponse> {
  await sleep(TIME_BETWEEN_API_CALLS);
  const functionsByResource = {
    opportunity: (x: NestedSchemaObject) => crmApi.opportunitiesAll(x),
    lead: (x: NestedSchemaObject) => crmApi.leadsAll(x),
    contact: (x: NestedSchemaObject) => crmApi.contactsAll(x),
    note: (x: NestedSchemaObject) => crmApi.notesAll(x),
    company: (x: NestedSchemaObject) => crmApi.companiesAll(x),
    pipeline: (x: NestedSchemaObject) => crmApi.pipelinesAll(x),
    activity: (x: NestedSchemaObject) => crmApi.activitiesAll(x),
    user: (x: NestedSchemaObject) => crmApi.usersAll(x),
  };
  // @ts-ignore
  return functionsByResource[apiDeckCrmAction.object]({
    filter: apiDeckCrmAction.params,
  });
}

export async function createOperation(
  crmApi: CrmApi,
  apiDeckCrmAction: APIDeckCRMAction
): Promise<APIDeckCRMResponse> {
  await sleep(TIME_BETWEEN_API_CALLS);
  const functionsByResource = {
    opportunity: (x: any) => crmApi.opportunitiesAdd(x),
    lead: (x: any) => crmApi.leadsAdd(x),
    contact: (x: any) => crmApi.contactsAdd(x),
    note: (x: any) => crmApi.notesAdd(x),
    company: (x: any) => crmApi.companiesAdd(x),
    pipeline: (x: any) => crmApi.pipelinesAdd(x),
    activity: (x: any) => crmApi.activitiesAdd(x),
    user: (x: any) => crmApi.usersAdd(x),
  };
  console.log("apiDeckCrmActionObject", apiDeckCrmAction.object);
  // @ts-ignore
  return functionsByResource[apiDeckCrmAction.object]({
    [apiDeckCrmAction.object]: apiDeckCrmAction.params,
  });
}

export async function updateOperation(
  crmApi: CrmApi,
  apiDeckCrmAction: APIDeckCRMAction
): Promise<APIDeckCRMResponse> {
  // TODO: find and update - 2 api calls\
  await sleep(TIME_BETWEEN_API_CALLS);
  const functionsByResource = {
    opportunity: (x: any) => crmApi.opportunitiesAdd(x),
    lead: (x: any) => crmApi.leadsAdd(x),
    contact: (x: any) => crmApi.contactsAdd(x),
    note: (x: any) => crmApi.notesAdd(x),
    company: (x: any) => crmApi.companiesAdd(x),
    pipeline: (x: any) => crmApi.pipelinesAdd(x),
    activity: (x: any) => crmApi.activitiesAdd(x),
    user: (x: any) => crmApi.usersAdd(x),
  };
  // @ts-ignore
  return functionsByResource[apiDeckCrmAction.object]({
    [apiDeckCrmAction.object]: apiDeckCrmAction.params,
  });
}

export async function callAPIDeckOperation(
  user: User,
  apiDeckCrmAction: APIDeckCRMAction
): Promise<APIDeckCRMResponse> {
  const apiDeck = await getApiDeckForUser(user);
  const crmApi: CrmApi = apiDeck.crm;
  const { operation } = apiDeckCrmAction;
  console.log("attempting operation", operation, apiDeckCrmAction.object);
  if (operation == "find") {
    return await findOperation(crmApi, apiDeckCrmAction);
  }
  if (operation == "findOrCreate") {
    try {
      const existing = await findOperation(crmApi, apiDeckCrmAction);
      if (existing?.data && existing.status_code) {
        return existing;
      }
    } catch (e) {
      console.error("received an error finding", apiDeckCrmAction.object, e);
    }
    console.error("no", apiDeckCrmAction.object, "exists");
    return createOperation(crmApi, apiDeckCrmAction);
  }
  if (operation == "create") {
    return createOperation(crmApi, apiDeckCrmAction);
  }
  throw "invalid operation";
}
