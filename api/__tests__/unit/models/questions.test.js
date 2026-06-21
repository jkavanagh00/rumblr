import testDb from "../../setup/testDb.js";
import { seedUser, seedStatement, seedResponse } from "../../setup/factories.js";
import {
  addStatement_model,
  getStatementById_model,
  listStatements_model,
  updateStatement_model,
  deleteStatement_model,
  addResponse_model,
  updateResponse_model,
  deleteResponse_model,
  listResponses_model,
  listUsersWhoResponded_model
} from "../../../src/models/statements.js";

const TABLE = "statements";
const RESPONSES_TABLE = "responses";
const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";
const statementId = "44444444-4444-4444-8444-444444444444";
const otherStatementId = "55555555-5555-4555-8555-555555555555";

describe("statements model", () => {
  beforeEach(async () => {
    await testDb("responses").del();
    await testDb(TABLE).del();
    await testDb("users").del();
  });

  describe("listStatements_model", () => {
    test("returns an array of statements", async () => {
      // Seed two rows so this test verifies the normal read path, not an empty-table edge case.
      await seedStatement(testDb, { id: statementId, content: "Content data 1" });
      await seedStatement(testDb, { id: otherStatementId, content: "Content data 2" });

      // Call the model directly with the in-memory test database to confirm it reads persisted statements.
      const result = await listStatements_model(testDb);

      // The list endpoint depends on this model returning every stored statement in an array.
      expect(result).toHaveLength(2);
    });
    test("returns null when no statements exist", async () => {
      // Call the model function with an empty table to test the model's explicit no-data behavior.
      const result = await listStatements_model(testDb);

      // This documents the current contract: no statements returns null instead of an empty array.
      expect(result).toBeNull();
    });
  });

  describe("addStatement_model", () => {
    test("inserts a single statement into the statements table", async () => {
      await addStatement_model({ content: "Content data" }, testDb);

      const rows = await testDb(TABLE).select("*");
      expect(rows).toHaveLength(1);
      expect(rows[0].content).toBe("Content data");
    });
    test("returns a knex insert response of the correct shape", async () => {
      const result = await addStatement_model(
        { content: "Content data" },
        testDb,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
    test("throws an error when content is missing", async () => {
      await expect(addStatement_model({}, testDb)).rejects.toThrow();
    });
  });

  describe("getStatementById_model", () => {
    test("returns a single statement with the correct id", async () => {
      await seedStatement(testDb, { id: statementId, content: "Content data" });
      const result = await getStatementById_model(statementId, testDb);
      expect(result.content).toBe("Content data");
      expect(result.id).toBe(statementId);
    });
    test("returns undefined when statement cannot be found", async () => {
      const result = await getStatementById_model(statementId, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("updateStatement_model", () => {
    test("returns updated statement data after a successful update", async () => {
      await testDb(TABLE).insert({ id: statementId, content: "Original content" });
      const result = await updateStatement_model(
        statementId,
        { content: "Updated content" },
        testDb,
      );
      expect(result.id).toBe(statementId);
      expect(result.content).toBe("Updated content");
    });
    test("returns undefined when statement cannot be found", async () => {
      const result = await updateStatement_model(1, { content: "Updated content" }, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("deleteStatement_model", () => {
    test("returns deleted statement data after a successful deletion", async () => {
      await testDb(TABLE).insert({ id: statementId, content: "Content data" });
      await deleteStatement_model(statementId, testDb);
      const result = await testDb(TABLE).select("*");
      expect(result).toHaveLength(0);
    });
    test("returns undefined when the statement cannot be found", async () => {
      const result = await deleteStatement_model(statementId, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("addResponse_model", () => {
    test("inserts a response row with valid scores", async () => {
      await seedUser(testDb, { id: userId, username: "user_main", email: "user_main@example.com" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      const response = {
        user_id: userId,
        statement_id: statementId,
        agreement_score: 5,
        importance_score: 4,
      };

      const result = await addResponse_model(response, testDb);
      const rows = await testDb(RESPONSES_TABLE).select("*");

      expect(Array.isArray(result)).toBe(true);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject(response);
    });

    test("throws when required score fields are missing", async () => {
      await seedUser(testDb, { id: userId, username: "user_missing-scores", email: "user_missing-scores@example.com" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      await expect(
        addResponse_model(
          {
            user_id: userId,
            statement_id: statementId,
            agreement_score: 5,
          },
          testDb,
        ),
      ).rejects.toThrow();
    });
  });

  describe("updateResponse_model", () => {
    test("updates and returns the response", async () => {
      await seedUser(testDb, { id: userId, username: "user_update", email: "user_update@example.com" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      await testDb(RESPONSES_TABLE).insert({
        user_id: userId,
        statement_id: statementId,
        agreement_score: 2,
        importance_score: 2,
      });

      const existing = await testDb(RESPONSES_TABLE).first("id");

      const result = await updateResponse_model(
        existing.id,
        {
          agreement_score: 4,
          importance_score: 5,
        },
        testDb,
      );

      expect(result.agreement_score).toBe(4);
      expect(result.importance_score).toBe(5);
    });

    test("returns undefined when response cannot be found", async () => {
      const result = await updateResponse_model(
        "66666666-6666-4666-8666-666666666666",
        { agreement_score: 3, importance_score: 3 },
        testDb,
      );

      expect(result).toBe(undefined);
    });
  });

  describe("deleteResponse_model", () => {
    test("deletes and returns the existing response", async () => {
      await seedUser(testDb, { id: userId, username: "user_delete", email: "user_delete@example.com" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      await testDb(RESPONSES_TABLE).insert({
        user_id: userId,
        statement_id: statementId,
        agreement_score: 1,
        importance_score: 5,
      });

      const existing = await testDb(RESPONSES_TABLE).first("id");

      const deleted = await deleteResponse_model(existing.id, testDb);
      const rows = await testDb(RESPONSES_TABLE).select("*");

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
      await seedUser(testDb, { id: userId, username: "user_list-main", email: "user_list-main@example.com" });
      await seedUser(testDb, { id: otherUserId, username: "user_list-other", email: "user_list-other@example.com" });
      await seedStatement(testDb, { id: statementId, content: "Statement one" });
      await seedStatement(testDb, { id: otherStatementId, content: "Statement two" });

      await testDb(RESPONSES_TABLE).insert([
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

      const result = await listResponses_model(userId, testDb);

      expect(result).toHaveLength(2);
      result.forEach((row) => expect(row.user_id).toBe(userId));
    });

    test("returns null when the user has no responses", async () => {
      await seedUser(testDb, { id: userId, username: "user_list-empty", email: "user_list-empty@example.com" });

      const result = await listResponses_model(userId, testDb);

      expect(result).toBeNull();
    });
  });

  describe("listUsersWhoResponded", () => {
    test("returns an array of ids for all other users who have responded to a statement", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedStatement(testDb, { id: statementId });
      await seedResponse(testDb, { user_id: userId, statement_id: statementId });
      await seedResponse(testDb, { user_id: otherUserId, statement_id: statementId });

      const result = await listUsersWhoResponded_model(statementId, userId, testDb);
      expect(result).toHaveLength(1);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBe(otherUserId);
    });
    test("does not return the ids of users without shared responses", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedStatement(testDb, { id: statementId });
      await seedResponse(testDb, { user_id: userId, statement_id: statementId });
      await seedResponse(testDb, { user_id: otherUserId, statement_id: otherStatementId });

      const result = await listUsersWhoResponded_model(statementId, userId, testDb);
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
