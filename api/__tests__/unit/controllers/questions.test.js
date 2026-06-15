import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/questions.js", () => ({
  addQuestion_Model: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const { addQuestion_Model } = await import("../../../src/models/questions.js");
const { addQuestion_Controller } = await import(
  "../../../src/controllers/questions.js"
);

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
    });
  });
});
