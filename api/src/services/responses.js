import {
  upsertResponse_model,
  fetchSharedResponses_model,
  listUsersWhoResponded_model,
  listResponses_model,
} from "../models/responses.js";
import { upsertMismatch_model } from "../models/mismatches.js";
import {
  getStatementById_model,
  getOnboardingProgress_model,
  ONBOARDING_STATEMENT_CONTENT,
} from "../models/statements.js";
import db from "../database/db.js";

function getOnboardingNumberByContent(content) {
  const entry = Object.entries(ONBOARDING_STATEMENT_CONTENT).find(
    ([, onboardingContent]) => onboardingContent === content,
  );

  return entry ? Number(entry[0]) : null;
}

export async function addResponse_service(userId, statementId, responseData) {
  const response = await db.transaction(async (trx) => {
    
    const statement = await getStatementById_model(statementId, trx);
    if (!statement) {
      throw new Error("No statement with provided id found");
    }
    const onboardingNumber = getOnboardingNumberByContent(statement.content);

    if (onboardingNumber) {
      const onboardingProgress = await getOnboardingProgress_model(userId, trx);

      if (
        !onboardingProgress.completed &&
        onboardingNumber !== onboardingProgress.nextNumber
      ) {
        const error = new Error(
          `You must answer onboarding statement ${onboardingProgress.nextNumber} next`,
        );
        error.status = 409;
        error.nextNumber = onboardingProgress.nextNumber;
        throw error;
      }
    }

    const upsertedResponse = await upsertResponse_model(
      statementId,
      userId,
      responseData,
      trx,
    );

    const totalResponses = await listResponses_model(userId, trx);

    if (totalResponses.length < 10) {
      return {
        upsertedResponse,
        totalUpsertedMismatches: 0,
      };
    }

    const otherUsersWithResponses = await listUsersWhoResponded_model(
      statementId,
      userId,
      trx,
    );

    let totalUpsertedMismatches = 0;
    for (const otherUserId of otherUsersWithResponses) {
      await upsertMismatch_model(userId, otherUserId, trx);
      totalUpsertedMismatches++;
    }

    return {
      upsertedResponse,
      totalUpsertedMismatches,
    };
  });

  return response;
}
