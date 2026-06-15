import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/questions.js", () => ({
  addQuestion_Model: jest.fn(),
  getQuestionById_Model: jest.fn(),
  listQuestions_Model: jest.fn(),
  updateQuestion_Model: jest.fn(),
  deleteQuestion_Model: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const {
  addQuestion_Model,
  getQuestionById_Model,
  listQuestions_Model,
  updateQuestion_Model,
  deleteQuestion_Model,
} = await import("../../../src/models/questions.js");
const {
  addQuestion_Controller,
  getQuestionById_Controller,
  listQuestions_Controller,
  updateQuestion_Controller,
  deleteQuestion_Controller,
} = await import("../../../src/controllers/questions.js");

const testId = "11111111-1111-4111-8111-111111111111";

describe("questions controller", () => {
  describe("addQuestion_Controller", () => {
    test("calls addQuestion_Model with the correct parameters", async () => {
      const mockQuestion = { content: "Test question" };
      addQuestion_Model.mockResolvedValue([1]);

      const result = await addQuestion_Controller(mockQuestion);
      expect(addQuestion_Model).toHaveBeenCalledWith(mockQuestion);
      expect(addQuestion_Model).toHaveBeenCalledTimes(1);
      expect(result).toEqual([1]);
    });
    test("throws an error when addQuestion_Model throws an error", async () => {
      const mockQuestion = { content: "Test question" };
      addQuestion_Model.mockRejectedValue(new Error("Database error"));

      await expect(addQuestion_Controller(mockQuestion)).rejects.toThrow(
        "Database error",
      );
      expect(addQuestion_Model).toHaveBeenCalledWith(mockQuestion);
    });
  });
  describe("getQuestionById_Controller", () => {
    test("calls getQuestionById_Model with the correct parameters", async () => {
      const mockQuestion = { id: testId, content: "Test question" };
      getQuestionById_Model.mockResolvedValue(mockQuestion);

      const result = await getQuestionById_Controller(testId);
      expect(getQuestionById_Model).toHaveBeenCalledWith(testId);
      expect(getQuestionById_Model).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQuestion);
    });
    test("throws an error when getQuestionById_Model throws an error", async () => {
      getQuestionById_Model.mockRejectedValue(new Error("Database error"));

      await expect(getQuestionById_Controller(testId)).rejects.toThrow(
        "Database error",
      );
      expect(getQuestionById_Model).toHaveBeenCalledWith(testId);
    });
  });
  describe("listQuestions_Controller", () => {
    test("calls listQuestions_Model and returns the result", async () => {
      const mockQuestions = [
        { id: "1", content: "Question 1" },
        { id: "2", content: "Question 2" },
      ];
      listQuestions_Model.mockResolvedValue(mockQuestions);

      const result = await listQuestions_Controller();
      expect(listQuestions_Model).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQuestions);
    });
    test("throws an error when listQuestions_Model throws an error", async () => {
      listQuestions_Model.mockRejectedValue(new Error("Database error"));

      await expect(listQuestions_Controller()).rejects.toThrow(
        "Database error",
      );
      expect(listQuestions_Model).toHaveBeenCalledTimes(1);
    });
  });
  describe("updateQuestion_Controller", () => {
    test("calls updateQuestion_Model with the correct parameters", async () => {
      const updateData = { content: "Updated content" };
      const mockUpdatedQuestion = { id: testId, content: "Updated content" };
      updateQuestion_Model.mockResolvedValue(mockUpdatedQuestion);

      const result = await updateQuestion_Controller(testId, updateData);
      expect(updateQuestion_Model).toHaveBeenCalledWith(testId, updateData);
      expect(result).toEqual(mockUpdatedQuestion);
    });
    test("throws an error when updateQuestion_Model throws an error", async () => {
      const updateData = { content: "Updated content" };
      updateQuestion_Model.mockRejectedValue(new Error("Database error"));

      await expect(
        updateQuestion_Controller(testId, updateData),
      ).rejects.toThrow("Database error");
      expect(updateQuestion_Model).toHaveBeenCalledWith(testId, updateData);
    });
  });
  describe("deleteQuestion_Controller", () => {
    test("calls deleteQuestion_Model with the correct parameters", async () => {
      const mockDeletedQuestion = { id: testId, content: "Deleted content" };
      deleteQuestion_Model.mockResolvedValue(mockDeletedQuestion);

      const result = await deleteQuestion_Controller(testId);
      expect(deleteQuestion_Model).toHaveBeenCalledWith(testId);
      expect(result).toEqual(mockDeletedQuestion);
    });
    test("throws an error when deleteQuestion_Model throws an error", async () => {
      deleteQuestion_Model.mockRejectedValue(new Error("Database error"));

      await expect(deleteQuestion_Controller(testId)).rejects.toThrow(
        "Database error",
      );
      expect(deleteQuestion_Model).toHaveBeenCalledWith(testId);
    });
  });
});
