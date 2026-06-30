import db from "../database/db.js";

const TABLE = "users";

function baseQuery(trx = db) {
  return trx(TABLE);
}

const userColumns = [
  "id",
  "username",
  "bio",
  "status",
  "role",
  "threat_levels",
  "created_at",
];

const publicUserColumns = userColumns;

function serializeUser(data) {
  return "threat_levels" in data
    ? { ...data, threat_levels: JSON.stringify(data.threat_levels) }
    : data;
}

function deserializeUser(user) {
  if (!user) return user;
  return {
    ...user,
    threat_levels:
      typeof user.threat_levels === "string"
        ? JSON.parse(user.threat_levels)
        : user.threat_levels ?? ["green"],
  };
}

export async function createUser_model(userData, trx = db) {
  const [createdUser] = await baseQuery(trx)
    .insert(serializeUser(userData))
    .returning(publicUserColumns);

  return deserializeUser(createdUser);
}

export async function getUserById_model(id, trx = db) {
  const user = await baseQuery(trx).select(userColumns).where({ id }).first();
  return deserializeUser(user);
}

export async function updateUserById_model(id, updateData, trx = db) {
  const existingUser = await baseQuery(trx).where({ id }).first();

  if (!existingUser) {
    return undefined;
  }

  const [updatedUser] = await baseQuery(trx)
    .where({ id })
    .update(serializeUser(updateData))
    .returning(userColumns);

  return deserializeUser(updatedUser);
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

  return deserializeUser(existingUser);
}

export async function findUserByEmail_model(email, trx = db) {
  const user = await baseQuery(trx).where({ email }).first();
  return deserializeUser(user);
}

export async function findUserByUsername_model(username, trx = db) {
  const user = await baseQuery(trx).where({ username }).first();
  return deserializeUser(user);
}

// this serves the same purpose as getUserById_model
export async function getPublicUserById_model(id, trx = db) {
  const user = await baseQuery(trx)
    .select(publicUserColumns)
    .where({ id })
    .first();

  return deserializeUser(user);
}
