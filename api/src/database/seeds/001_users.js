import { hashPassword } from "../../utils/helpers.js";

export async function seed(knex) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  await knex("users").where({ email }).del();

  await knex("users").insert({
    username: "admin",
    email,
    password_hash: await hashPassword(password),
    bio: "Admin user",
    role: "admin",
  });
}
