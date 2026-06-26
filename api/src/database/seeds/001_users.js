import { hashPassword } from "../../utils/helpers.js";

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  
  // admin user  
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
  
    const seedPassword = await hashPassword("password123");

  // Inserts seed entries with diverse test data
    await knex("users").insert([

    // Core test users for various scenarios
    {
      username: "alice_agrees",
      email: "alice@example.com",
      password_hash: seedPassword,
      bio: "I like to agree on important issues",
      status: "active",
    },
    {
      username: "bob_disagrees",
      email: "bob@example.com",
      password_hash: seedPassword,
      bio: "I often have contrarian opinions",
      status: "active",
    },
    {
      username: "carol_moderate",
      email: "carol@example.com",
      password_hash: seedPassword,
      bio: "I take a balanced approach",
      status: "active",
    },
    {
      username: "david_active",
      email: "david@example.com",
      password_hash: seedPassword,
      bio: "Always ready for a rumble",
      status: "active",
    },
    {
      username: "emma_passive",
      email: "emma@example.com",
      password_hash: seedPassword,
      bio: "Prefers to observe",
      status: "active",
    },
    {
      username: "frank_blocked",
      email: "frank@example.com",
      password_hash: seedPassword,
      bio: "Gets blocked by others",
      status: "active",
    },
    {
      username: "grace_blocker",
      email: "grace@example.com",
      password_hash: seedPassword,
      bio: "Blocks problematic users",
      status: "active",
    },
    {
      username: "henry_inactive",
      email: "henry@example.com",
      password_hash: seedPassword,
      bio: "No longer active",
      status: "inactive",
    },
    {
      username: "iris_suspended",
      email: "iris@example.com",
      password_hash: seedPassword,
      bio: "Account suspended",
      status: "suspended",
    },
    {
      username: "jack_response_heavy",
      email: "jack@example.com",
      password_hash: seedPassword,
      bio: "Responds to many statements",
      status: "active",
    },
    {
      username: "karen_response_light",
      email: "karen@example.com",
      password_hash: seedPassword,
      bio: "Selective responder",
      status: "active",
    },
    {
      username: "leo_test_user",
      email: "leo@example.com",
      password_hash: seedPassword,
      bio: "Test account",
      status: "active",
    },
  ]);
}