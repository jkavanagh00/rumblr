import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/questions.js", () => ({
  addQuestion_model: jest.fn(),
  getQuestionById_model: jest.fn(),
  listQuestions_model: jest.fn(),
  updateQuestion_model: jest.fn(),
  deleteQuestion_model: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const {
  addQuestion_model,
  getQuestionById_model,
  listQuestions_model,
  updateQuestion_model,
  deleteQuestion_model,
} = await import("../../../src/models/questions.js");
const {
  addQuestion_controller,
  getQuestionById_controller,
  listQuestions_controller,
  updateQuestion_controller,
  deleteQuestion_controller,
} = await import("../../../src/controllers/questions.js");

const testId = "11111111-1111-4111-8111-111111111111";

describe("questions controller", () => {
  describe("addQuestion_controller", () => {
    test("calls addQuestion_model with the correct parameters", async () => {
      const mockQuestion = { content: "Test question" };
      addQuestion_model.mockResolvedValue([1]);

      const result = await addQuestion_controller(mockQuestion);
      expect(addQuestion_model).toHaveBeenCalledWith(mockQuestion);
      expect(addQuestion_model).toHaveBeenCalledTimes(1);
      expect(result).toEqual([1]);
    });
    test("throws an error when addQuestion_model throws an error", async () => {
      const mockQuestion = { content: "Test question" };
      addQuestion_model.mockRejectedValue(new Error("Database error"));

      await expect(addQuestion_controller(mockQuestion)).rejects.toThrow(
        "Database error",
      );
      expect(addQuestion_model).toHaveBeenCalledWith(mockQuestion);
    });
  });
  describe("getQuestionById_controller", () => {
    test("calls getQuestionById_model with the correct parameters", async () => {
      const mockQuestion = { id: testId, content: "Test question" };
      getQuestionById_model.mockResolvedValue(mockQuestion);

      const result = await getQuestionById_controller(testId);
      expect(getQuestionById_model).toHaveBeenCalledWith(testId);
      expect(getQuestionById_model).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQuestion);
    });
    test("throws an error when getQuestionById_model throws an error", async () => {
      getQuestionById_model.mockRejectedValue(new Error("Database error"));

      await expect(getQuestionById_controller(testId)).rejects.toThrow(
        "Database error",
      );
      expect(getQuestionById_model).toHaveBeenCalledWith(testId);
    });
  });
  describe("listQuestions_controller", () => {
    test("calls listQuestions_model and returns the result", async () => {
      // Mock the model response so this test stays focused on controller orchestration only.
      const mockQuestions = [
        { id: "1", content: "Question 1" },
        { id: "2", content: "Question 2" },
      ];
      listQuestions_model.mockResolvedValue(mockQuestions);

      // The controller should delegate to the model and forward the resolved value unchanged.
      const result = await listQuestions_controller();

      // This confirms the controller does not add parameters, transform the payload, or skip the model call.
      expect(listQuestions_model).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockQuestions);
    });
    test("throws an error when listQuestions_model throws an error", async () => {
      // Force a model failure so the test covers the controller's error propagation path.
      listQuestions_model.mockRejectedValue(new Error("Database error"));

      // The route layer relies on the controller to reject when the underlying read fails.
      await expect(listQuestions_controller()).rejects.toThrow(
        "Database error",
      );

      // Even in the failure case, the controller should still have attempted the model call once.
      expect(listQuestions_model).toHaveBeenCalledTimes(1);
    });
  });
  describe("updateQuestion_controller", () => {
    test("calls updateQuestion_model with the correct parameters", async () => {
      const updateData = { content: "Updated content" };
      const mockUpdatedQuestion = { id: testId, content: "Updated content" };
      updateQuestion_model.mockResolvedValue(mockUpdatedQuestion);

      const result = await updateQuestion_controller(testId, updateData);
      expect(updateQuestion_model).toHaveBeenCalledWith(testId, updateData);
      expect(result).toEqual(mockUpdatedQuestion);
    });
    test("throws an error when updateQuestion_model throws an error", async () => {
      const updateData = { content: "Updated content" };
      updateQuestion_model.mockRejectedValue(new Error("Database error"));

      await expect(
        updateQuestion_controller(testId, updateData),
      ).rejects.toThrow("Database error");
      expect(updateQuestion_model).toHaveBeenCalledWith(testId, updateData);
    });
  });
  describe("deleteQuestion_controller", () => {
    test("calls deleteQuestion_model with the correct parameters", async () => {
      const mockDeletedQuestion = { id: testId, content: "Deleted content" };
      deleteQuestion_model.mockResolvedValue(mockDeletedQuestion);

      const result = await deleteQuestion_controller(testId);
      expect(deleteQuestion_model).toHaveBeenCalledWith(testId);
      expect(result).toEqual(mockDeletedQuestion);
    });
    test("throws an error when deleteQuestion_model throws an error", async () => {
      deleteQuestion_model.mockRejectedValue(new Error("Database error"));

      await expect(deleteQuestion_controller(testId)).rejects.toThrow(
        "Database error",
      );
      expect(deleteQuestion_model).toHaveBeenCalledWith(testId);
    });
  });
});
