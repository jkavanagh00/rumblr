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
  // IDs are hardcoded so they can be referenced in Swagger UI examples
  await knex("users").insert([

    // Core test users for various scenarios
    {
      id: "fef581bd-7396-4446-a337-ae6cd8bff6cf",
      username: "alice_agrees",
      email: "alice@example.com",
      password_hash: seedPassword,
      bio: "I like to agree on important issues",
      status: "active",
    },
    {
      id: "fb9123f7-1666-4850-97b3-237647a07b15",
      username: "bob_disagrees",
      email: "bob@example.com",
      password_hash: seedPassword,
      bio: "I often have contrarian opinions",
      status: "active",
    },
    {
      id: "66151732-4c06-4372-8bee-00dcb3a5d446",
      username: "carol_moderate",
      email: "carol@example.com",
      password_hash: seedPassword,
      bio: "I take a balanced approach",
      status: "active",
    },
    {
      id: "1c8dd889-2423-4663-8c37-47dcc810b92e",
      username: "david_active",
      email: "david@example.com",
      password_hash: seedPassword,
      bio: "Always ready for a rumble",
      status: "active",
    },
    {
      id: "8b70c362-1fae-4f19-b59f-1404164587b9",
      username: "emma_passive",
      email: "emma@example.com",
      password_hash: seedPassword,
      bio: "Prefers to observe",
      status: "active",
    },
    {
      id: "468e1877-ec10-4bb8-9385-3320cc6ed093",
      username: "frank_blocked",
      email: "frank@example.com",
      password_hash: seedPassword,
      bio: "Gets blocked by others",
      status: "active",
    },
    {
      id: "5b1c48ce-66ca-4d0c-9c91-4b2f1c237d80",
      username: "grace_blocker",
      email: "grace@example.com",
      password_hash: seedPassword,
      bio: "Blocks problematic users",
      status: "active",
    },
    {
      id: "6d19cc5f-70da-4cfa-b0aa-d8a8786e49f1",
      username: "henry_inactive",
      email: "henry@example.com",
      password_hash: seedPassword,
      bio: "No longer active",
      status: "inactive",
    },
    {
      id: "80559e31-7f86-4cfd-96a2-572c7cf61c1a",
      username: "iris_suspended",
      email: "iris@example.com",
      password_hash: seedPassword,
      bio: "Account suspended",
      status: "suspended",
    },
    {
      id: "bcea8827-c2f2-45b9-860e-4be1d21038e9",
      username: "jack_response_heavy",
      email: "jack@example.com",
      password_hash: seedPassword,
      bio: "Responds to many statements",
      status: "active",
    },
    {
      id: "021b8d48-f542-4e6a-adc3-ba739ff501ef",
      username: "karen_response_light",
      email: "karen@example.com",
      password_hash: seedPassword,
      bio: "Selective responder",
      status: "active",
    },
    {
      id: "c79b3431-17ab-47b9-86a5-22bd6911ff21",
      username: "leo_test_user",
      email: "leo@example.com",
      password_hash: seedPassword,
      bio: "Test account",
      status: "active",
    },
  ]);
}