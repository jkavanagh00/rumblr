/*
all common helper functions should be here
*/
import bcrypt from "bcrypt";

export async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new Error("Password must be a string of at least 8 characters");
  }
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, passwordHash) {
  if (typeof password !== "string" || password.length < 8) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}
