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
  "bio",
  "status",
  "role",
  "threat_levels",
  "created_at",
];

const publicUserColumns = userColumns;

export async function createUser_model(userData, trx = db) {
  const dataToInsert =
    "threat_levels" in userData
      ? {
          ...userData,
          threat_levels: JSON.stringify(userData.threat_levels),
        }
      : userData;

  const [createdUser] = await baseQuery(trx)
    .insert(dataToInsert)
    .returning(publicUserColumns);

  if (!createdUser) {
    return createdUser;
  }

  return {
    ...createdUser,
    threat_levels:
      typeof createdUser.threat_levels === "string"
        ? JSON.parse(createdUser.threat_levels)
        : createdUser.threat_levels ?? ["green"],
  };
}

export async function getUserById_model(id, trx = db) {
  const user = await baseQuery(trx).select(userColumns).where({ id }).first();

  if (!user) {
    return user;
  }

  return {
    ...user,
    threat_levels:
      typeof user.threat_levels === "string"
        ? JSON.parse(user.threat_levels)
        : user.threat_levels ?? ["green"],
  };
}

export async function updateUserById_model(id, updateData, trx = db) {
  const existingUser = await baseQuery(trx).where({ id }).first();

  if (!existingUser) {
    return undefined;
  }

  const dataToUpdate =
    "threat_levels" in updateData
      ? {
          ...updateData,
          threat_levels: JSON.stringify(updateData.threat_levels),
        }
      : updateData;

  const [updatedUser] = await baseQuery(trx)
    .where({ id })
    .update(dataToUpdate)
    .returning(userColumns);

  if (!updatedUser) {
    return updatedUser;
  }

  return {
    ...updatedUser,
    threat_levels:
      typeof updatedUser.threat_levels === "string"
        ? JSON.parse(updatedUser.threat_levels)
        : updatedUser.threat_levels ?? ["green"],
  };
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

  return {
    ...existingUser,
    threat_levels:
      typeof existingUser.threat_levels === "string"
        ? JSON.parse(existingUser.threat_levels)
        : existingUser.threat_levels ?? ["green"],
  };
}

export async function findUserByEmail_model(email, trx = db) {
  const user = await baseQuery(trx).where({ email }).first();

  if (!user) {
    return user;
  }

  return {
    ...user,
    threat_levels:
      typeof user.threat_levels === "string"
        ? JSON.parse(user.threat_levels)
        : user.threat_levels ?? ["green"],
  };
}

export async function findUserByUsername_model(username, trx = db) {
  const user = await baseQuery(trx).where({ username }).first();

  if (!user) {
    return user;
  }

  return {
    ...user,
    threat_levels:
      typeof user.threat_levels === "string"
        ? JSON.parse(user.threat_levels)
        : user.threat_levels ?? ["green"],
  };
}

// this serves the same purpose as getUserById_model
export async function getPublicUserById_model(id, trx = db) {
  const user = await baseQuery(trx)
    .select(publicUserColumns)
    .where({ id })
    .first();

  if (!user) {
    return user;
  }

  return {
    ...user,
    threat_levels:
      typeof user.threat_levels === "string"
        ? JSON.parse(user.threat_levels)
        : user.threat_levels ?? ["green"],
  };
}
