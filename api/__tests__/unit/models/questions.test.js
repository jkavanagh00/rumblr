import testDb from "../../setup/testDb.js";
import {
  getQuestion,
  listAllQuestions,
} from "../../../src/models/questions.js";

describe("questions model", () => {
  beforeEach(async () => {
    await testDb("responses").del();
    await testDb("questions").del();
    await testDb("users").del();
  });
  
  describe("listAllQuestions", () => {
    test("returns an array of questions", async () => {
      await testDb("questions").insert([
        { id: "1", content: "Something 1" },
        { id: "2", content: "Something 2" },
      ]);
      const result = await listAllQuestions(testDb);
      expect(result).toHaveLength(2);
    });
    test("returns null when no questions exist", async () => {
      const result = await listAllQuestions(testDb);
      expect(result).toBeNull();
    });
  });
});
