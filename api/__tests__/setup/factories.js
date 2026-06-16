/**
 * Test data factories for seeding the test database.
 * These helpers provide a consistent, readable way to insert test fixtures.
 */

import { randomUUID } from "node:crypto";

export async function seedUser(testDb, overrides = {}) {
  const unique = randomUUID();
  const defaultData = {
    username: `test_user_${unique}`,
    email: `test_${unique}@example.com`,
    password_hash: "hashed_password",
  };

  const data = { ...defaultData, ...overrides };

  await testDb("users").insert(data);
  return data;
}

export async function seedQuestion(testDb, overrides = {}) {
  const defaultData = {
    content: "Test question content",
  };

  const data = { ...defaultData, ...overrides };

  await testDb("questions").insert(data);
  return data;
}

export async function seedResponse(testDb, overrides = {}) {
  const user_id =
    overrides.user_id ??
    (await seedUser(testDb, {
      id: randomUUID(),
      username: "response_user",
      email: "response_user@example.com",
    })).id;

  const question_id =
    overrides.question_id ??
    (await seedQuestion(testDb, {
      id: randomUUID(),
      content: "Response question",
    })).id;

  const defaultData = {
    user_id,
    question_id,
    agreement_score: 3,
    importance_score: 3,
  };

  const data = { ...defaultData, ...overrides, user_id, question_id };

  await testDb("responses").insert(data);
  return data;
}

export async function seedMismatch(testDb, overrides = {}) {
  const user1Raw =
    overrides.user1_id ??
    (await seedUser(testDb, {
      id: randomUUID(),
      username: "mismatch_user_a",
      email: "mismatch_user_a@example.com",
    })).id;

  const user2Raw =
    overrides.user2_id ??
    (await seedUser(testDb, {
      id: randomUUID(),
      username: "mismatch_user_b",
      email: "mismatch_user_b@example.com",
    })).id;

  if (user1Raw === user2Raw) {
    throw new Error("seedMismatch requires two distinct users");
  }

  const [user1_id, user2_id] = [user1Raw, user2Raw].sort();

  const defaultData = {
    user1_id,
    user2_id,
    mismatch_score: 80,
    shared_responses: 25,
    confidence: "low",
  };

  const data = { ...defaultData, ...overrides, user1_id, user2_id };

  await testDb("mismatches").insert(data);
  return data;
}
