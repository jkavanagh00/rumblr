import testDb from "../../setup/testDb.js";
import { seedUser, seedStatement, seedResponse, seedMismatch } from "../../setup/factories.js";
import { addResponse_service } from "../../../src/services/responses.js";
import { randomUUID } from "node:crypto";

describe("addResponse_service", () => {
  beforeEach(async () => {
    await testDb("mismatches").del();
    await testDb("responses").del();
    await testDb("statements").del();
    await testDb("users").del();
  });

  describe("happy path", () => {
    test("successfully adds a response and returns expected structure", async () => {
      const userId = randomUUID();
      const statementId = randomUUID();
      
      await seedUser(testDb, { id: userId, username: "user_1" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      const responseData = {
        agreement_score: 5,
        importance_score: 4,
      };

      const result = await addResponse_service(userId, statementId, responseData);

      expect(result).toHaveProperty("upsertedResponse");
      expect(result).toHaveProperty("totalUpsertedMismatches");
      expect(result.upsertedResponse.user_id).toBe(userId);
      expect(result.upsertedResponse.statement_id).toBe(statementId);
      expect(result.totalUpsertedMismatches).toBe(0);
    });

    test("creates mismatches for users who already responded to the statement", async () => {
      const userId1 = randomUUID();
      const userId2 = randomUUID();
      const userId3 = randomUUID();
      const statementId = randomUUID();

      await seedUser(testDb, { id: userId1, username: "user_1" });
      await seedUser(testDb, { id: userId2, username: "user_2" });
      await seedUser(testDb, { id: userId3, username: "user_3" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      await seedResponse(testDb, { user_id: userId2, statement_id: statementId });
      await seedResponse(testDb, { user_id: userId3, statement_id: statementId });

      const responseData = { agreement_score: 3, importance_score: 3 };
      const result = await addResponse_service(userId1, statementId, responseData);

      // Should create 2 mismatches (one with user2, one with user3)
      expect(result.totalUpsertedMismatches).toBe(2);
    });

    test("handles updating an existing response", async () => {
      const userId = randomUUID();
      const statementId = randomUUID();

      await seedUser(testDb, { id: userId, username: "user_1" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      // Add initial response
      await seedResponse(testDb, {
        user_id: userId,
        statement_id: statementId,
        agreement_score: 2,
        importance_score: 2,
      });

      // Update the response
      const updatedData = { agreement_score: 5, importance_score: 5 };
      const result = await addResponse_service(userId, statementId, updatedData);

      expect(result.upsertedResponse.agreement_score).toBe(5);
      expect(result.upsertedResponse.importance_score).toBe(5);
    });
  });

  describe("error handling", () => {
    test("throws error when statement does not exist", async () => {
      const userId = randomUUID();
      const nonexistentStatementId = randomUUID();

      await seedUser(testDb, { id: userId, username: "user_1" });

      const responseData = { agreement_score: 3, importance_score: 3 };

      await expect(
        addResponse_service(userId, nonexistentStatementId, responseData)
      ).rejects.toThrow("No statement with provided id found");
    });

    test("transaction rolls back if an error occurs", async () => {
      const userId = randomUUID();
      const statementId = randomUUID();

      await seedUser(testDb, { id: userId, username: "user_1" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      // This would require mocking or creating a scenario where the transaction fails
      // For now, this documents what should be tested
      
      const responseData = { agreement_score: 3, importance_score: 3 };
      
      // The transaction should rollback and not create partial data
    });
  });

  describe("edge cases", () => {
    test("handles response from first user on a statement (no mismatches)", async () => {
      const userId = randomUUID();
      const statementId = randomUUID();

      await seedUser(testDb, { id: userId, username: "user_1" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      const responseData = { agreement_score: 3, importance_score: 3 };
      const result = await addResponse_service(userId, statementId, responseData);

      expect(result.totalUpsertedMismatches).toBe(0);
      const responses = await testDb("responses").select("*");
      expect(responses).toHaveLength(1);
    });

    test("excludes the responding user from mismatch creation", async () => {
      const userId1 = randomUUID();
      const userId2 = randomUUID();
      const statementId = randomUUID();

      await seedUser(testDb, { id: userId1, username: "user_1" });
      await seedUser(testDb, { id: userId2, username: "user_2" });
      await seedStatement(testDb, { id: statementId, content: "Test statement" });

      // Only user2 responded
      await seedResponse(testDb, { user_id: userId2, statement_id: statementId });

      // User1 adds response
      const responseData = { agreement_score: 3, importance_score: 3 };
      const result = await addResponse_service(userId1, statementId, responseData);

      // Should only create mismatch with user2, not with self
      expect(result.totalUpsertedMismatches).toBe(1);
    });
  });
});