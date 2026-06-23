import testDb from "../../setup/testDb.js";
import {
  seedUser,
  seedStatement,
  seedResponse,
} from "../../setup/factories.js";
import {
  addStatement_model,
  getStatementById_model,
  listStatements_model,
  updateStatement_model,
  deleteStatement_model,
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
      await seedStatement(testDb, {
        id: statementId,
        content: "Content data 1",
      });
      await seedStatement(testDb, {
        id: otherStatementId,
        content: "Content data 2",
      });

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
      await testDb(TABLE).insert({
        id: statementId,
        content: "Original content",
      });
      const result = await updateStatement_model(
        statementId,
        { content: "Updated content" },
        testDb,
      );
      expect(result.id).toBe(statementId);
      expect(result.content).toBe("Updated content");
    });
    test("returns undefined when statement cannot be found", async () => {
      const result = await updateStatement_model(
        1,
        { content: "Updated content" },
        testDb,
      );
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
});
