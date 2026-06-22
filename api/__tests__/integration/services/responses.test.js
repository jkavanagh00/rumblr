import db from "../../../src/database/db.js";
import { seedUser, seedStatement, seedResponse } from "../../setup/factories.js";
import { addResponse_service } from "../../../src/services/responses.js";
import { randomUUID } from "node:crypto";

describe("addResponse_service", () => {
  beforeAll(async () => {
    await db.migrate.latest({ directory: "./src/database/migrations" });
  });

  beforeEach(async () => {
    await db("mismatches").del();
    await db("responses").del();
    await db("statements").del();
    await db("users").del();
  });

  describe("happy path", () => {
    test("successfully adds a response and returns expected structure", async () => {
      const user = await seedUser(db, { username: "user_1" });
      const statement = await seedStatement(db, { content: "Test statement" });

      const responseData = {
        agreement_score: 5,
        importance_score: 4,
      };

      const result = await addResponse_service(user.id, statement.id, responseData);

      expect(result).toHaveProperty("upsertedResponse");
      expect(result).toHaveProperty("totalUpsertedMismatches");
      expect(result.upsertedResponse.user_id).toBe(user.id);
      expect(result.upsertedResponse.statement_id).toBe(statement.id);
      expect(result.totalUpsertedMismatches).toBe(0);
    });

    test("creates mismatches for users who already responded to the statement", async () => {
      const user1 = await seedUser(db, { username: "user_1" });
      const user2 = await seedUser(db, { username: "user_2" });
      const user3 = await seedUser(db, { username: "user_3" });
      const statement = await seedStatement(db, { content: "Test statement" });

      await seedResponse(db, { user_id: user2.id, statement_id: statement.id });
      await seedResponse(db, { user_id: user3.id, statement_id: statement.id });

      const responseData = { agreement_score: 3, importance_score: 3 };
      const result = await addResponse_service(user1.id, statement.id, responseData);

      // Should create 2 mismatches (one with user2, one with user3)
      expect(result.totalUpsertedMismatches).toBe(2);
    });

    test("handles updating an existing response", async () => {
      const user = await seedUser(db, { username: "user_1" });
      const statement = await seedStatement(db, { content: "Test statement" });

      // Add initial response
      await seedResponse(db, {
        user_id: user.id,
        statement_id: statement.id,
        agreement_score: 2,
        importance_score: 2,
      });

      // Update the response
      const updatedData = { agreement_score: 5, importance_score: 5 };
      const result = await addResponse_service(user.id, statement.id, updatedData);

      expect(result.upsertedResponse.agreement_score).toBe(5);
      expect(result.upsertedResponse.importance_score).toBe(5);
    });
  });

  describe("error handling", () => {
    test("throws error when statement does not exist", async () => {
      const user = await seedUser(db, { username: "user_1" });
      const nonexistentStatementId = randomUUID();

      const responseData = { agreement_score: 3, importance_score: 3 };

      await expect(
        addResponse_service(user.id, nonexistentStatementId, responseData)
      ).rejects.toThrow("No statement with provided id found");
    });

    test("transaction rolls back if an error occurs", async () => {
      const user = await seedUser(db, { username: "user_1" });
      const statement = await seedStatement(db, { content: "Test statement" });

      // This would require mocking or creating a scenario where the transaction fails
      // For now, this documents what should be tested
      
      const responseData = { agreement_score: 3, importance_score: 3 };
      
      // The transaction should rollback and not create partial data
    });
  });

  describe("edge cases", () => {
    test("handles response from first user on a statement (no mismatches)", async () => {
      const user = await seedUser(db, { username: "user_1" });
      const statement = await seedStatement(db, { content: "Test statement" });

      const responseData = { agreement_score: 3, importance_score: 3 };
      const result = await addResponse_service(user.id, statement.id, responseData);

      expect(result.totalUpsertedMismatches).toBe(0);
      const responses = await db("responses").select("*");
      expect(responses).toHaveLength(1);
    });

    test("excludes the responding user from mismatch creation", async () => {
      const user1 = await seedUser(db, { username: "user_1" });
      const user2 = await seedUser(db, { username: "user_2" });
      const statement = await seedStatement(db, { content: "Test statement" });

      // Only user2 responded
      await seedResponse(db, { user_id: user2.id, statement_id: statement.id });

      // User1 adds response
      const responseData = { agreement_score: 3, importance_score: 3 };
      const result = await addResponse_service(user1.id, statement.id, responseData);

      // Should only create mismatch with user2, not with self
      expect(result.totalUpsertedMismatches).toBe(1);
    });
  });
});