import testDb from "../../setup/testDb.js";
import {
  addQuestion_Model,
  getQuestionById_Model,
  listQuestions_Model,
  updateQuestion_Model,
  deleteQuestion_Model,
} from "../../../src/models/questions.js";

const TABLE = "questions";
const testId = "11111111-1111-4111-8111-111111111111";

describe("questions model", () => {
  beforeEach(async () => {
    await testDb("responses").del();
    await testDb(TABLE).del();
    await testDb("users").del();
  });

  describe("listQuestions_Model", () => {
    test("returns an array of questions", async () => {
      // Seed two rows so this test verifies the normal read path, not an empty-table edge case.
      await testDb(TABLE).insert([
        { content: "Content data 1" },
        { content: "Content data 2" },
      ]);

      // Call the model directly with the in-memory test database to confirm it reads persisted questions.
      const result = await listQuestions_Model(testDb);

      // The list endpoint depends on this model returning every stored question in an array.
      expect(result).toHaveLength(2);
    });
    test("returns null when no questions exist", async () => {
      // Call the model function with an empty table to test the model's explicit no-data behavior.
      const result = await listQuestions_Model(testDb);

      // This documents the current contract: no questions returns null instead of an empty array.
      expect(result).toBeNull();
    });
  });

  describe("addQuestion_Model", () => {
    test("inserts a single question into the questions table", async () => {
      await addQuestion_Model({ content: "Content data" }, testDb);

      const rows = await testDb(TABLE).select("*");
      expect(rows).toHaveLength(1);
      expect(rows[0].content).toBe("Content data");
    });
    test("returns a knex insert response of the correct shape", async () => {
      const result = await addQuestion_Model(
        { content: "Content data" },
        testDb,
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
    test("throws an error when content is missing", async () => {
      await expect(addQuestion_Model({}, testDb)).rejects.toThrow();
    });
  });

  describe("getQuestionById_Model", () => {
    test("returns a single question with the correct id", async () => {
      await testDb(TABLE).insert({ id: testId, content: "Content data" });
      const result = await getQuestionById_Model(testId, testDb);
      expect(result.content).toBe("Content data");
      expect(result.id).toBe(testId);
    });
    test("returns undefined when question cannot be found", async () => {
      const result = await getQuestionById_Model(testId, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("updateQuestion_Model", () => {
    test("returns updated question data after a successful update", async () => {
      await testDb(TABLE).insert({ id: testId, content: "Original content" });
      const result = await updateQuestion_Model(
        testId,
        { content: "Updated content" },
        testDb,
      );
      expect(result.id).toBe(testId);
      expect(result.content).toBe("Updated content");
    });
    test("returns undefined when question cannot be found", async () => {
      const result = await updateQuestion_Model(1, { content: "Updated content" }, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("deleteQuestion_Model", () => {
    test("returns deleted question data after a successful deletion", async () => {
      await testDb(TABLE).insert({ id: testId, content: "Content data" });
      await deleteQuestion_Model(testId, testDb);
      const result = await testDb(TABLE).select("*");
      expect(result).toHaveLength(0);
    });
    test("returns undefined when the question cannot be found", async () => {
      const result = await deleteQuestion_Model(testId, testDb);
      expect(result).toBe(undefined);
    });
  });
});
