/**
 * Test data factories for seeding the test database.
 * These helpers provide a consistent, readable way to insert test fixtures.
 */

import { randomUUID } from "node:crypto";

export async function seedUser(testDb, overrides = {}) {
  const unique = randomUUID();
  const id = overrides.id || randomUUID();
  const defaultData = {
    id,
    username: `test_user_${unique}`,
    email: `test_${unique}@example.com`,
    password_hash: "hashed_password",
    status: "active",
  };

  const data = { ...defaultData, ...overrides };

  await testDb("users").insert(data);

  return data;
}

export async function seedStatement(testDb, overrides = {}) {
  const id = overrides.id || randomUUID();
  const defaultData = {
    id,
    content: "Test statement content",
  };

  const data = { ...defaultData, ...overrides };

  await testDb("statements").insert(data);

  return data;
}

export async function seedResponse(testDb, overrides = {}) {
  let user_id = overrides.user_id;
  if (!user_id) {
    const user = await seedUser(testDb, {
      username: "response_user",
      email: "response_user@example.com",
    });
    user_id = user.id;
  }

  let statement_id = overrides.statement_id;
  if (!statement_id) {
    const statement = await seedStatement(testDb, {
      content: "Response statement",
    });
    statement_id = statement.id;
  }

  const id = overrides.id || randomUUID();
  const defaultData = {
    id,
    user_id,
    statement_id,
    agreement_score: 3,
    importance_score: 3,
  };

  const data = { ...defaultData, ...overrides, user_id, statement_id };

  await testDb("responses").insert(data);

  return data;
}

export async function seedMismatch(testDb, overrides = {}) {
  let user1_id = overrides.user1_id;
  if (!user1_id) {
    const user = await seedUser(testDb, {
      username: "mismatch_user_a",
      email: "mismatch_user_a@example.com",
    });
    user1_id = user.id;
  }

  let user2_id = overrides.user2_id;
  if (!user2_id) {
    const user = await seedUser(testDb, {
      username: "mismatch_user_b",
      email: "mismatch_user_b@example.com",
    });
    user2_id = user.id;
  }

  if (user1_id === user2_id) {
    throw new Error("seedMismatch requires two distinct users");
  }

  const [sortedUser1, sortedUser2] = [user1_id, user2_id].sort();
  const id = overrides.id || randomUUID();

  const defaultData = {
    id,
    user1_id: sortedUser1,
    user2_id: sortedUser2,
    mismatch_score: 80,
    shared_responses: 25,
    confidence: "low",
  };

  const data = {
    ...defaultData,
    ...overrides,
    user1_id: sortedUser1,
    user2_id: sortedUser2,
  };

  await testDb("mismatches").insert(data);

  return data;
}
