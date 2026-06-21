/*
all models related to users should be here

examples:

- listUsers
- findUserById
- createUser
- updateUser
- removeUser
*/

import db from "../database/db.js";

const TABLE = "users";

function baseQuery(trx = db) {
  return trx(TABLE);
}

const userColumns = [
  "id",
  "username",
  "email",
  "bio",
  "status",
  "created_at",
];

export async function getUserById_model(id, trx = db) {
  return await baseQuery(trx).select(userColumns).where({ id }).first();
}

export async function updateUserById_model(id, updateData, trx = db) {
  const existingUser = await baseQuery(trx).where({ id }).first();

  if (!existingUser) {
    return undefined;
  }

  const [updatedUser] = await baseQuery(trx)
    .where({ id })
    .update(updateData)
    .returning(userColumns);

  return updatedUser;
}

export async function deleteUserById_model(id, trx = db) {
  const existingUser = await baseQuery(trx)
    .select(userColumns)
    .where({ id })
    .first();

  if (!existingUser) {
    return undefined;
  }

  await baseQuery(trx).where({ id }).delete();

  return existingUser;
}
