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
  "role",
  "created_at",
];

export async function createUser_model(userData, trx = db) {
  const [createdUser] = await baseQuery(trx)
    .insert(userData)
    .returning(publicUserColumns);

  return createdUser;
}

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

export async function findUserByEmail_model(email, trx = db) {
  return baseQuery(trx).where({ email }).first();
}

export async function findUserByUsername_model(username, trx = db) {
  return baseQuery(trx).where({ username }).first();
}

// this serves the same purpose as getUserById_model
export async function getPublicUserById_model(id, trx = db) {
  return baseQuery(trx).select(publicUserColumns).where({ id }).first();
}