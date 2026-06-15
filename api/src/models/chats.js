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
    .andWhere({ status: "scheduled" }) // I'll update the scheduled when status change in migration
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

export async function isUserParticipantInRumble_model(rumbleId, userId, trx = db) {
  const rumble = await rumblesQuery(trx)
    .where({ id: rumbleId })
    .andWhere((builder) => {
      builder.where({ requester_id: userId }).orWhere({ receiver_id: userId });
    })
    .first();

  return Boolean(rumble);
}
export async function updateChat_model(id, updates, trx = db) {
  const [chat] = await rumblesQuery(trx)
    .where({ id })
    .update(updates)
    .returning("*");

  return chat;
}

export async function removeChat_model(id, trx = db) {
  const [chat] = await rumblesQuery(trx).where({ id }).del().returning("*");

  return chat;
}

export async function addMessage_model({ rumble_id, sender_id, content }, trx = db) {
  const [message] = await messagesQuery(trx)
    .insert({
      rumble_id,
      sender_id,
      content,
    })
    .returning("*");

  return message;
}

// This function  can be use for the message update and delete in controller
export async function getMessageById_model(messageId, trx = db) {
  return await messagesQuery(trx).select("*").where({ id: messageId }).first();
}

export async function updateMessage_model(messageId, updateData, trx = db) {
  const existingMessage = await getMessageById_model(messageId, trx);

  if (!existingMessage) {
    return undefined;
  }

  await messagesQuery(trx).where({ id: messageId }).update(updateData);

  return await getMessageById_model(messageId, trx);
}

export async function removeMessage_model(messageId, trx = db) {
  const existingMessage = await getMessageById_model(messageId, trx);

  if (!existingMessage) {
    return undefined;
  }

  await messagesQuery(trx).where({ id: messageId }).delete();

  return existingMessage;
}
