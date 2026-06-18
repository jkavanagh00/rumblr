/*
all models related to accounts should be here

examples:

- listAccounts
- findAccountById
- createAccount
- updateAccount
- removeAccount
*/

import db from "../database/db.js";

const TABLE = "users";

function baseQuery(trx = db) {
  return trx(TABLE);
}

const accountColumns = [
  "id",
  "username",
  "email",
  "bio",
  "status",
  "created_at",
];

export async function getAccountById_model(id, trx = db) {
  return await baseQuery(trx).select(accountColumns).where({ id }).first();
}

export async function updateAccountById_model(id, updateData, trx = db) {
  const existingUser = await baseQuery(trx).where({ id }).first();

  if (!existingUser) {
    return undefined;
  }

  const [updatedUser] = await baseQuery(trx)
    .where({ id })
    .update(updateData)
    .returning(accountColumns);

  return updatedUser;
}

export async function deleteAccountById_model(id, trx = db) {
  const existingUser = await baseQuery(trx)
    .select(accountColumns)
    .where({ id })
    .first();

  if (!existingUser) {
    return undefined;
  }

  await baseQuery(trx).where({ id }).delete();

  return existingUser;
}
