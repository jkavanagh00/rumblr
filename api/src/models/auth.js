import db from "../database/db.js";

const TABLE = "users";

const publicUserColumns = [
  "id",
  "username",
  "email",
  "bio",
  "status",
  "created_at",
];

function baseQuery(trx = db) {
  return trx(TABLE);
}

export async function findUserByEmail_model(email, trx = db) {
  return baseQuery(trx).where({ email }).first();
}

export async function findUserByUsername_model(username, trx = db) {
  return baseQuery(trx).where({ username }).first();
}

export async function createUser_model(userData, trx = db) {
  const [createdUser] = await baseQuery(trx)
    .insert(userData)
    .returning(publicUserColumns);

  return createdUser;
}

export async function getPublicUserById_model(id, trx = db) {
  return baseQuery(trx).select(publicUserColumns).where({ id }).first();
}