import db from "../database/db.js";

const RUMBLES_TABLE = "rumbles";
const MESSAGES_TABLE = "messages";

function rumblesQuery(trx = db) {
  return trx(RUMBLES_TABLE);
}

function messagesQuery(trx = db) {
  return trx(MESSAGES_TABLE);
}

export async function addChat_model(chatData, trx = db) {
  const [chat] = await rumblesQuery(trx).insert(chatData).returning("*");
  return chat;
}

export async function getActiveChatsByUserId_model(userId, trx = db) {
  return await rumblesQuery(trx)
    .select("*")
    .where((builder) => {
      builder.where({ requester_id: userId }).orWhere({ receiver_id: userId });
    })
    .andWhere({ status: "active" })
    .orderBy("created_at", "desc");
}

export async function getMessagesByRumbleId_model(
  rumbleId,
  { page = 1, limit = 20 } = {},
  trx = db,
) {
  const offset = (page - 1) * limit;

  const data = await messagesQuery(trx)
    .select("*")
    .where({ rumble_id: rumbleId })
    .orderBy("sent_at", "asc")
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
    },
  };
}

export async function getRumbleById_model(id, trx = db) {
  return await rumblesQuery(trx).where({ id }).first();
}

export async function updateRumbleStatus_model(id, status, trx = db) {
  const [updated] = await rumblesQuery(trx)
    .where({ id })
    .update({ status })
    .returning("*");

  return updated;
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

export async function addMessage_model(
  { rumble_id, sender_id, content },
  trx = db,
) {
  const [message] = await messagesQuery(trx)
    .insert({
      rumble_id,
      sender_id,
      content,
    })
    .returning("*");

  return message;
}
