/**
 * Test data factories for seeding the test database.
 * These helpers provide a consistent, readable way to insert test fixtures.
 */

export async function seedUser(testDb, overrides = {}) {
  const defaultData = {
    username: "test_user",
    email: "test@example.com",
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
  const defaultData = {
    agreement_score: 3,
    importance_score: 3,
  };

  const data = { ...defaultData, ...overrides };

  await testDb("responses").insert(data);
  return data;
}
