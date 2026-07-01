import db from "../database/db.js";

const BLOCKS_TABLE = "blocks";
const USERS_TABLE = "users";

function blocksQuery(trx = db) {
  return trx(BLOCKS_TABLE);
}

export async function createBlock_model(blockerId, blockedId, trx = db) {
  const [block] = await blocksQuery(trx)
    .insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
    })
    .returning("*");

  return block;
}

export async function getBlockByUsers_model(blockerId, blockedId, trx = db) {
  return blocksQuery(trx)
    .where({
      blocker_id: blockerId,
      blocked_id: blockedId,
    })
    .first();
}

export async function getBlockBetweenUsers_model(userAId, userBId, trx = db) {
  return blocksQuery(trx)
    .where((builder) => {
      builder
        .where({ blocker_id: userAId, blocked_id: userBId })
        .orWhere({ blocker_id: userBId, blocked_id: userAId });
    })
    .first();
}

export async function deleteBlock_model(blockerId, blockedId, trx = db) {
  return blocksQuery(trx)
    .where({
      blocker_id: blockerId,
      blocked_id: blockedId,
    })
    .delete();
}

export async function getBlockedUsersByBlockerId_model(
  blockerId,
  pagination = {},
  trx = db,
) {
  const { page = 1, limit = 20 } = pagination;
  const offset = (page - 1) * limit;

  const [countResult] = await blocksQuery(trx)
    .where(`${BLOCKS_TABLE}.blocker_id`, blockerId)
    .count({ total: "*" });
  const total = Number(countResult.total);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const data = await blocksQuery(trx)
    .join(USERS_TABLE, `${BLOCKS_TABLE}.blocked_id`, `${USERS_TABLE}.id`)
    .select(
      `${BLOCKS_TABLE}.id as block_id`,
      `${BLOCKS_TABLE}.created_at as blocked_at`,
      `${USERS_TABLE}.id`,
      `${USERS_TABLE}.username`,
      `${USERS_TABLE}.bio`,
      `${USERS_TABLE}.status`,
      `${USERS_TABLE}.role`,
      `${USERS_TABLE}.created_at`,
    )
    .where(`${BLOCKS_TABLE}.blocker_id`, blockerId)
    .orderBy(`${BLOCKS_TABLE}.created_at`, "desc")
    .limit(limit)
    .offset(offset);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
