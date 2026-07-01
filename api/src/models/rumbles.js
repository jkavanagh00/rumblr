import db from "../database/db.js";
import { paginate } from "../utils/pagination.js";

const RUMBLES_TABLE = "rumbles";
const MESSAGES_TABLE = "messages";

function rumblesQuery(trx = db) {
  return trx(RUMBLES_TABLE);
}

function messagesQuery(trx = db) {
  return trx(MESSAGES_TABLE);
}

export async function addRumble_model(rumbleData, trx = db) {
  const [rumble] = await rumblesQuery(trx).insert(rumbleData).returning("*");
  return rumble;
}

export async function getRumblesByUserId_model(
  userId,
  pagination = {},
  trx = db,
) {
  return paginate(
    rumblesQuery(trx)
      .where((builder) => {
        builder
          .where({ requester_id: userId })
          .orWhere({ receiver_id: userId });
      })
      .whereIn("status", ["active", "inactive"]),
    pagination,
    (qb) => qb.orderBy("created_at", "desc"),
  );
}

export async function getRumbleById_model(id, trx = db) {
  return await rumblesQuery(trx).where({ id }).first();
}

export async function getActiveRumbleBetweenUsers_model(
  userId,
  otherUserId,
  trx = db,
) {
  return await rumblesQuery(trx)
    .where({ status: "active" })
    .andWhere((builder) => {
      builder
        .where({ requester_id: userId, receiver_id: otherUserId })
        .orWhere({ requester_id: otherUserId, receiver_id: userId });
    })
    .orderBy("created_at", "desc")
    .first();
}

export async function updateRumbleStatus_model(id, status, trx = db) {
  const [updated] = await rumblesQuery(trx)
    .where({ id })
    .update({ status })
    .returning("*");

  return updated;
}

export async function terminateRumble_model(id, trx = db) {
  return updateRumbleStatus_model(id, "terminated", trx);
}

export async function isUserParticipantInRumble_model(
  rumbleId,
  userId,
  trx = db,
) {
  const rumble = await rumblesQuery(trx)
    .where({ id: rumbleId })
    .andWhere((builder) => {
      builder.where({ requester_id: userId }).orWhere({ receiver_id: userId });
    })
    .first();

  return Boolean(rumble);
}
