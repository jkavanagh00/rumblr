import testDb from "../../setup/testDb.js";
import { seedUser, seedQuestion, seedResponse } from "../../setup/factories.js";
import {
  addQuestion_Model,
  getQuestionById_Model,
  listQuestions_Model,
  updateQuestion_Model,
  deleteQuestion_Model,
  addResponse_model,
  updateResponse_model,
  deleteResponse_model,
  listResponses_model,
  listUsersWhoResponded_model
} from "../../../src/models/questions.js";

const TABLE = "questions";
const RESPONSES_TABLE = "responses";
const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";
const questionId = "44444444-4444-4444-8444-444444444444";
const otherQuestionId = "55555555-5555-4555-8555-555555555555";

describe("questions model", () => {
  beforeEach(async () => {
    await testDb("responses").del();
    await testDb(TABLE).del();
    await testDb("users").del();
  });

  describe("listQuestions_Model", () => {
    test("returns an array of questions", async () => {
      // Seed two rows so this test verifies the normal read path, not an empty-table edge case.
      await seedQuestion(testDb, { id: questionId, content: "Content data 1" });
      await seedQuestion(testDb, { id: otherQuestionId, content: "Content data 2" });

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
      await seedQuestion(testDb, { id: questionId, content: "Content data" });
      const result = await getQuestionById_Model(questionId, testDb);
      expect(result.content).toBe("Content data");
      expect(result.id).toBe(questionId);
    });
    test("returns undefined when question cannot be found", async () => {
      const result = await getQuestionById_Model(questionId, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("updateQuestion_Model", () => {
    test("returns updated question data after a successful update", async () => {
      await testDb(TABLE).insert({ id: questionId, content: "Original content" });
      const result = await updateQuestion_Model(
        questionId,
        { content: "Updated content" },
        testDb,
      );
      expect(result.id).toBe(questionId);
      expect(result.content).toBe("Updated content");
    });
    test("returns undefined when question cannot be found", async () => {
      const result = await updateQuestion_Model(1, { content: "Updated content" }, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("deleteQuestion_Model", () => {
    test("returns deleted question data after a successful deletion", async () => {
      await testDb(TABLE).insert({ id: questionId, content: "Content data" });
      await deleteQuestion_Model(questionId, testDb);
      const result = await testDb(TABLE).select("*");
      expect(result).toHaveLength(0);
    });
    test("returns undefined when the question cannot be found", async () => {
      const result = await deleteQuestion_Model(questionId, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("addResponse_model", () => {
    test("inserts a response row with valid scores", async () => {
      await seedUser(testDb, { id: userId, username: "user_main", email: "user_main@example.com" });
      await seedQuestion(testDb, { id: questionId, content: "Test question" });

      const response = {
        user_id: userId,
        question_id: questionId,
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
      await seedQuestion(testDb, { id: questionId, content: "Test question" });

      await expect(
        addResponse_model(
          {
            user_id: userId,
            question_id: questionId,
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
      await seedQuestion(testDb, { id: questionId, content: "Test question" });

      await testDb(RESPONSES_TABLE).insert({
        user_id: userId,
        question_id: questionId,
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
      await seedQuestion(testDb, { id: questionId, content: "Test question" });

      await testDb(RESPONSES_TABLE).insert({
        user_id: userId,
        question_id: questionId,
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
      await seedQuestion(testDb, { id: questionId, content: "Question one" });
      await seedQuestion(testDb, { id: otherQuestionId, content: "Question two" });

      await testDb(RESPONSES_TABLE).insert([
        {
          user_id: userId,
          question_id: questionId,
          agreement_score: 5,
          importance_score: 5,
        },
        {
          user_id: userId,
          question_id: otherQuestionId,
          agreement_score: 2,
          importance_score: 1,
        },
        {
          user_id: otherUserId,
          question_id: questionId,
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
    test("returns an array of ids for all other users who have responded to a question", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedQuestion(testDb, { id: questionId });
      await seedResponse(testDb, { user_id: userId, question_id: questionId });
      await seedResponse(testDb, { user_id: otherUserId, question_id: questionId });

      const result = await listUsersWhoResponded_model(questionId, userId, testDb);
      expect(result).toHaveLength(1);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toBe(otherUserId);
    });
    test("does not return the ids of users without shared responses", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedQuestion(testDb, { id: questionId });
      await seedResponse(testDb, { user_id: userId, question_id: questionId });
      await seedResponse(testDb, { user_id: otherUserId, question_id: otherQuestionId });

      const result = await listUsersWhoResponded_model(questionId, userId, testDb);
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
