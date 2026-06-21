import { listResponses_model } from "../models/responses.js";

export async function addResponse_controller(req, res, next) {
  try {
    const statementId = req.params.id;
    const userId = req.user.id;
    const payload = req.validatedBody;
    const statement = await getStatementById_model(statementId);

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    const response = await db.transaction(async (trx) => {
      const upsertedResponse = await upsertResponse_model(
        statementId,
        userId,
        payload,
        trx,
      );

      const otherUsersWithResponses = await listUsersWhoResponded_model(
        statementId,
        userId,
        trx,
      );

      for (const otherUserId of otherUsersWithResponses) {
        await upsertMismatch(userId, otherUserId, trx);
      }
      return upsertedResponse;
    });
    return res
      .status(201)
      .json({ message: "Response submitted successfully", response });
  } catch (error) {
    next(error);
  }
}

export async function listResponses_controller(req, res, next) {
  try {
    const responses = await listResponses_model(req.user.id);

    if (!responses) {
      return res.status(404).json({ error: "No responses found" });
    }

    return res.status(200).json(responses);
  } catch (error) {
    next(error);
  }
}
