import testDb from "../../setup/testDb";
import {
  fetchSharedResponses_model,
  upsertResponse_model,
  deleteResponse_model,
  listResponses_model,
  listUsersWhoResponded_model,
} from "../../../src/models/responses.js";
import {
  seedUser,
  seedResponse,
  seedStatement,
} from "../../setup/factories.js";

const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";
const statementId = "44444444-4444-4444-8444-444444444444";
const otherStatementId = "55555555-5555-4555-8555-555555555555";

const TABLE = "responses";

beforeEach(async () => {
  await testDb("responses").del();
  await testDb("statements").del();
  await testDb("users").del();
});

describe("fetchSharedResponses", () => {
  test("returns only responses where both users answered the same statement", async () => {
    await seedUser(testDb, { id: userId });
    await seedUser(testDb, { id: otherUserId });
    await seedResponse(testDb, { user_id: userId, statement_id: statementId });
    await seedResponse(testDb, {
      user_id: userId,
      statement_id: otherStatementId,
    });
    await seedResponse(testDb, {
      user_id: otherUserId,
      statement_id: statementId,
    });

    const result = await fetchSharedResponses_model(
      userId,
      otherUserId,
      testDb,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
  });
  test("returns shared responses with the expected score field mapping", async () => {
    await seedUser(testDb, { id: userId });
    await seedUser(testDb, { id: otherUserId });
    await seedResponse(testDb, { user_id: userId, statement_id: statementId });
    await seedResponse(testDb, {
      user_id: otherUserId,
      statement_id: statementId,
    });

    const result = await fetchSharedResponses_model(
      userId,
      otherUserId,
      testDb,
    );
    expect(result).toHaveLength(1);
    const row = result[0];
    expect(row).toEqual(
      expect.objectContaining({
        statement_id: statementId,
        user1_agreement_score: expect.any(Number),
        user1_importance_score: expect.any(Number),
        user2_agreement_score: expect.any(Number),
        user2_importance_score: expect.any(Number),
      }),
    );
    expect(row.user1_agreement_score).toBeGreaterThanOrEqual(1);
    expect(row.user1_agreement_score).toBeLessThanOrEqual(5);
    expect(row.user1_importance_score).toBeGreaterThanOrEqual(1);
    expect(row.user1_importance_score).toBeLessThanOrEqual(5);
    expect(row.user2_agreement_score).toBeGreaterThanOrEqual(1);
    expect(row.user2_agreement_score).toBeLessThanOrEqual(5);
    expect(row.user2_importance_score).toBeGreaterThanOrEqual(1);
    expect(row.user2_importance_score).toBeLessThanOrEqual(5);
  });
  test("returns an empty array when users have no shared responses", async () => {
    await seedUser(testDb, { id: userId });
    await seedUser(testDb, { id: otherUserId });
    await seedResponse(testDb, { user_id: userId, statement_id: statementId });
    await seedResponse(testDb, {
      user_id: otherUserId,
      statement_id: otherStatementId,
    });

    const result = await fetchSharedResponses_model(
      userId,
      otherUserId,
      testDb,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
  test("returns an empty array when either user has no responses", async () => {
    await seedUser(testDb, { id: userId });
    await seedUser(testDb, { id: otherUserId });
    await seedResponse(testDb, { user_id: userId, statement_id: statementId });

    const result = await fetchSharedResponses_model(
      userId,
      otherUserId,
      testDb,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });
});

describe("upsertResponse_model", () => {
  test("inserts a response row with valid scores", async () => {
    await seedUser(testDb, {
      id: userId,
      username: "user_main",
      email: "user_main@example.com",
    });
    await seedStatement(testDb, {
      id: statementId,
      content: "Test statement",
    });

    const response = {
      user_id: userId,
      statement_id: statementId,
      agreement_score: 5,
      importance_score: 4,
    };

    const result = await upsertResponse_model(
      statementId,
      userId,
      {
        agreement_score: response.agreement_score,
        importance_score: response.importance_score,
      },
      testDb,
    );
    const rows = await testDb(TABLE).select("*");

    expect(result).toBeDefined();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject(response);
  });

  test("throws when required score fields are missing", async () => {
    await seedUser(testDb, {
      id: userId,
      username: "user_missing-scores",
      email: "user_missing-scores@example.com",
    });
    await seedStatement(testDb, {
      id: statementId,
      content: "Test statement",
    });

    await expect(
      upsertResponse_model(
        statementId,
        userId,
        {
          agreement_score: 5,
        },
        testDb,
      ),
    ).rejects.toThrow();
  });
});

describe("deleteResponse_model", () => {
  test("deletes and returns the existing response", async () => {
    await seedUser(testDb, {
      id: userId,
      username: "user_delete",
      email: "user_delete@example.com",
    });
    await seedStatement(testDb, {
      id: statementId,
      content: "Test statement",
    });

    await testDb(TABLE).insert({
      user_id: userId,
      statement_id: statementId,
      agreement_score: 1,
      importance_score: 5,
    });

    const existing = await testDb(TABLE).first("id");

    const deleted = await deleteResponse_model(existing.id, testDb);
    const rows = await testDb(TABLE).select("*");

    expect(deleted.id).toBe(existing.id);
    expect(rows).toHaveLength(0);
  });

  test("returns undefined when response cannot be found", async () => {
    const result = await deleteResponse_model(
      "77777777-7777-4777-8777-777777777777",
      testDb,
    );

    expect(result).toBe(undefined);
  });
});

describe("listResponses_model", () => {
  test("returns all responses for a specific user", async () => {
    await seedUser(testDb, {
      id: userId,
      username: "user_list-main",
      email: "user_list-main@example.com",
    });
    await seedUser(testDb, {
      id: otherUserId,
      username: "user_list-other",
      email: "user_list-other@example.com",
    });
    await seedStatement(testDb, {
      id: statementId,
      content: "Statement one",
    });
    await seedStatement(testDb, {
      id: otherStatementId,
      content: "Statement two",
    });

    await testDb(TABLE).insert([
      {
        user_id: userId,
        statement_id: statementId,
        agreement_score: 5,
        importance_score: 5,
      },
      {
        user_id: userId,
        statement_id: otherStatementId,
        agreement_score: 2,
        importance_score: 1,
      },
      {
        user_id: otherUserId,
        statement_id: statementId,
        agreement_score: 3,
        importance_score: 3,
      },
    ]);

    const result = await listResponses_model(userId, {}, testDb);

    expect(result.data).toHaveLength(2);
    result.data.forEach((row) => expect(row.user_id).toBe(userId));
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  test("returns an empty array when the user has no responses", async () => {
    await seedUser(testDb, {
      id: userId,
      username: "user_list-empty",
      email: "user_list-empty@example.com",
    });

    const result = await listResponses_model(userId, {}, testDb);

    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toHaveLength(0);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });
});

describe("listUsersWhoResponded", () => {
  test("returns an array of ids for all other users who have responded to a statement", async () => {
    await seedUser(testDb, { id: userId });
    await seedUser(testDb, { id: otherUserId });
    await seedStatement(testDb, { id: statementId });
    await seedResponse(testDb, {
      user_id: userId,
      statement_id: statementId,
    });
    await seedResponse(testDb, {
      user_id: otherUserId,
      statement_id: statementId,
    });

    const result = await listUsersWhoResponded_model(
      statementId,
      userId,
      testDb,
    );
    expect(result).toHaveLength(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toBe(otherUserId);
  });
  test("does not return the ids of users without shared responses", async () => {
    await seedUser(testDb, { id: userId });
    await seedUser(testDb, { id: otherUserId });
    await seedStatement(testDb, { id: statementId });
    await seedResponse(testDb, {
      user_id: userId,
      statement_id: statementId,
    });
    await seedResponse(testDb, {
      user_id: otherUserId,
      statement_id: otherStatementId,
    });

    const result = await listUsersWhoResponded_model(
      statementId,
      userId,
      testDb,
    );
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});
