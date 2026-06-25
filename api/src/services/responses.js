import {
  upsertResponse_model,
  fetchSharedResponses_model,
  listUsersWhoResponded_model,
  listResponses_model,
} from "../models/responses.js";
import { upsertMismatch_model } from "../models/mismatches.js";
import { getStatementById_model } from "../models/statements.js";
import db from "../database/db.js";

export async function addResponse_service(userId, statementId, responseData) {
  const response = await db.transaction(async (trx) => {
    
    const statement = await getStatementById_model(statementId, trx);
    if (!statement) {
      throw new Error("No statement with provided id found");
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
