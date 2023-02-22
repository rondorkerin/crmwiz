import { callAPIDeckOperation } from "./operations";
import { User } from "@/models/User";

type APIDeckCRMObject =
  | "company"
  | "opportunity"
  | "lead"
  | "contact"
  | "pipeline"
  | "note"
  | "activity"
  | "user";
type APIDeckCRMOperation =
  | "findOrCreate"
  | "find"
  | "update"
  | "create"
  | "delete";
export type NestedSchemaObject = {
  [key: string]:
    | NestedSchemaObject
    | string
    | number
    | boolean
    | NestedSchemaObject[];
};
type APIDeckCRMParams = NestedSchemaObject;
export interface APIDeckCRMResponse {
  status_code: number;
  status: string | "OK";
  service: string;
  resource: APIDeckCRMObject;
  operation: APIDeckCRMOperation;
  data: NestedSchemaObject | NestedSchemaObject[] | null | undefined;
}

interface APIDeckInvalidStage {
  userInput: string;
  validStages: string[];
}

interface APIDeckCRMFieldDescription {
  key: string;
  name: string;
  type: string;
}

export interface APIDeckCRMAction {
  object: APIDeckCRMObject;
  operation: APIDeckCRMOperation;
  params: APIDeckCRMParams;
  missingForeignKeys?: APIDeckCRMFieldDescription[];
  missingRequiredFields?: APIDeckCRMFieldDescription[];
  invalidStage?: APIDeckInvalidStage;
}
export type APIDeckCRMWorkflow = APIDeckCRMAction[];

export interface APIDeckCRMWorkflowResult {
  object: APIDeckCRMObject;
  operation: APIDeckCRMOperation;
  params: APIDeckCRMParams;
  response?: APIDeckCRMResponse;
  missingForeignKeys?: APIDeckCRMFieldDescription[];
  missingRequiredFields?: APIDeckCRMFieldDescription[];
  invalidStage?: APIDeckInvalidStage;
  errors?: string[];
  success: boolean;
}

export interface APIDeckCRMUserContext {
  validOpportunityStages: string[];
  ownerId: string; // TODO: owner id of the user in the CRM
  currentCrm: string;
}

function hasLength(value: any): boolean {
  return value && value.length > 0;
}

// validate CRM Action, replace $fields with actual values ETC.
export async function processCRMAction(
  crmAction: APIDeckCRMAction,
  prevWorkflowResults: APIDeckCRMWorkflowResult[],
  crmUserContext: APIDeckCRMUserContext
): Promise<{ [x: string]: any }> {
  const params = crmAction.params;
  const actionResult: { [x: string]: any } = {
    success: true,
    params: crmAction.params,
    operation: crmAction.operation,
    object: crmAction.object,
    errors: [],
  };
  if (params.owner_id) {
    params.owner_id = crmUserContext.ownerId;
  }
  // validate pipeline stage is valid
  if (
    crmAction.object == "opportunity" &&
    crmAction.params.stage &&
    !crmUserContext.validOpportunityStages.includes(
      crmAction.params!.stage as string
    )
  ) {
    actionResult.success = false;
    actionResult.invalidStage = {
      userInput: crmAction.params.stage,
      validStages: crmUserContext.validOpportunityStages,
    };
  }

  for (let [key, value] of Object.entries(crmAction.params)) {
    if (value.toString().includes("$")) {
      const [matched, stepNumber, field] = value
        .toString()
        .match(/^\$step([0-9]+)_([a-zA-Z0-9_]+)$/) || [null, null, null];
      if (matched && stepNumber !== null && field !== null) {
        const prevResponse = prevWorkflowResults[parseInt(stepNumber)].response;
        console.log("pulling prevResponse", matched, prevResponse?.data);

        if (!prevResponse?.data || typeof prevResponse?.data !== "object") {
          actionResult.success = false;
          actionResult.errors.push(
            `Could not find id for ${key} in workflow step ${crmAction.object} ${crmAction.operation}`
          );
          break;
        }
        if (prevResponse.data.length > 0) {
          crmAction.params[key] = (
            prevResponse.data as NestedSchemaObject[]
          )[0].id;
        } else {
          crmAction.params[key] = (prevResponse.data as NestedSchemaObject).id;
        }
      }
    }
  }

  return actionResult;
}

export async function processAPIDeckCRMWorkflow(
  user: User,
  workflowString: string,
  crmUserContext: APIDeckCRMUserContext
): Promise<APIDeckCRMWorkflowResult[]> {
  let workflow = JSON.parse(workflowString) as APIDeckCRMWorkflow;

  const workflowResults: APIDeckCRMWorkflowResult[] = [];
  // step 1: check if anything in the workflow has missingForeignKeys or missingRequiredFields and if so, don't process the workflow.
  const shouldProcessWorkflow = workflow.reduce(
    (shouldProcess, crmAction) =>
      !(
        hasLength(crmAction.missingForeignKeys) ||
        hasLength(crmAction.missingRequiredFields) ||
        !shouldProcess
      ),
    true
  );
  for (let crmAction of workflow) {
    const actionResult = await processCRMAction(
      crmAction,
      workflowResults,
      crmUserContext
    );
    if (hasLength(crmAction.missingForeignKeys)) {
      actionResult.success = false;
      actionResult.missingForeignKeys = crmAction.missingForeignKeys;
    }
    if (hasLength(crmAction.missingRequiredFields)) {
      actionResult.success = false;
      actionResult.missingRequiredFields = crmAction.missingRequiredFields;
    }

    if (shouldProcessWorkflow) {
      try {
        actionResult.response = await callAPIDeckOperation(user, crmAction);
      } catch (e) {
        actionResult.errors.push(e);
        actionResult.success = false;
        console.log("error", e);
      }
    }

    workflowResults.push(actionResult as APIDeckCRMWorkflowResult);
  }
  return workflowResults;
}

function getNaturalLanguageResult(
  workflowResult: APIDeckCRMWorkflowResult,
  index: number
): string {
  let foreignKeyResponse = "",
    requiredFieldResponse = "",
    successResponse = "Operation failed.";
  if (hasLength(workflowResult.missingForeignKeys)) {
    foreignKeyResponse = workflowResult
      .missingForeignKeys!.map((x) => x.name)
      .join(", ");
  }
  if (hasLength(workflowResult.missingRequiredFields)) {
    requiredFieldResponse = workflowResult
      .missingRequiredFields!.map((x) => x.name)
      .join(", ");
  }
  if (hasLength(workflowResult.invalidStage)) {
    requiredFieldResponse = `Valid pipeline stage. You said: ${
      workflowResult.invalidStage!.userInput
    }, proper values: ${workflowResult.invalidStage!.validStages.join(", ")}`;
  }
  let summary = "";
  if (foreignKeyResponse || requiredFieldResponse) {
    summary = `Operation Failed. Please specify the following: ${foreignKeyResponse}${requiredFieldResponse}`;
  } else if (!workflowResult.success) {
    summary = `Operation Failed: Result: ${JSON.stringify(
      workflowResult.response
    )}`;
  } else {
    summary = `Operation Succeeded: Result: ${JSON.stringify(
      workflowResult.response
    )}`;
  }

  let translatedResult = `Step ${index}: ${workflowResult.operation} on ${workflowResult.object}.\n${summary}`;
  return translatedResult;
}

export async function translateWorkflowResultsToNaturalLanguage(
  workflowResults: APIDeckCRMWorkflowResult[]
): Promise<string> {
  const botResponse = workflowResults
    .map<string>(getNaturalLanguageResult)
    .join("\n");
  return botResponse;
}
