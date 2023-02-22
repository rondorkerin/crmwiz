import callOpenAI from "@/lib/openai";
import { User } from "@/models/User";
import { interpretNLP as apiDeckNLP } from "@/vendors/apideck/crm";
import {
  APIDeckCRMUserContext,
  processAPIDeckCRMWorkflow,
  translateWorkflowResultsToNaturalLanguage,
} from "@/vendors/apideck/crm/interpreter";

export async function generalCrmEvent(
  currentCrm: string,
  message: string,
  user: User
): Promise<string> {
  // TODO need to get pipelines working. gotta pull down pipelines and validate them before

  // [{"object":"company","operation":"findOrCreate","params":{"name":"Disneyworld","owner_id":123}},{"object":"contact","operation":"findOrCreate","params":{"name":"Nick Bryant","email":"s@bryant.com"}},{"object":"opportuntiy","operation":"create","params":{"title":"Disneyworld","monetary_amount":"100000","win_probability":"50","stage":"negotiation","primary_contact_id":"$step1_id","company_id":"$step0_id","owner_id":123}}]
  //const nlpResponse = JSON.stringify([{"object":"company","operation":"findOrCreate","params":{"name":"HappyMeals","owner_id":123}},{"object":"contact","operation":"findOrCreate","params":{"name":"Nick Bryant","email":"sbryant31@gmail.com"}},{"object":"opportuntiy","operation":"create","params":{"title":"Happy","monetary_amount":"800000","stage":"starting","win_probability":"50","primary_contact_id":"$step1_id","company_id":"$step0_id","owner_id":123}}])
  //const nlpResponse = JSON.stringify([{"object":"opportunity","operation":"create","params":{"title":"happy","monetary_amount":"800000","close_chance":"50","stage":"starting"},"missingRequiredFields":[{"key":"primary_contact_id","name":"Primary Contact"},{"key":"company_id","name":"Associated Company"}]}])
  // [{"object":"company","operation":"findOrCreate","params":{"name":"Disneyworld","owner_id":123}},{"object":"contact","operation":"findOrCreate","params":{"name":"Nick Bryant","email":"s@bryant.com"}},{"object":"opportuntiy","operation":"create","params":{"title":"Disneyworld","monetary_amount":"100000","win_probability":"50","stage":"negotiation","primary_contact_id":"$step1_id","company_id":"$step0_id","owner_id":123}}]
  // todo: make dynamic
  const apiDeckCrmUserContext: APIDeckCRMUserContext = {
    // crmApi.validOpportunityStages();
    validOpportunityStages: [
      "new",
      "qualifying",
      "demo",
      "pending",
      "in negotiation",
      "won",
      "lost",
    ],
    ownerId: "328493160",
    currentCrm: "hubspot",
  };
  const nlpResponse = await apiDeckNLP(user, apiDeckCrmUserContext, message);
  const workflowResult = await processAPIDeckCRMWorkflow(
    user,
    nlpResponse,
    apiDeckCrmUserContext
  );
  console.log("workflowResult", workflowResult);
  return JSON.stringify(workflowResult);
  /*
  const humanReadableResult = await translateWorkflowResultsToNaturalLanguage(workflowResult);
  console.log('humanReadableResult', humanReadableResult);

  return humanReadableResult;
  */
}
