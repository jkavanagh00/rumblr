import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/statements.js", () => ({
  addStatement_model: jest.fn(),
  getStatementById_model: jest.fn(),
  listStatements_model: jest.fn(),
  updateStatement_model: jest.fn(),
  deleteStatement_model: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const {
  addStatement_model,
  getStatementById_model,
  listStatements_model,
  updateStatement_model,
  deleteStatement_model,
} = await import("../../../src/models/statements.js");
const {
  addStatement_controller,
  getStatementById_controller,
  listStatements_controller,
  updateStatement_controller,
  deleteStatement_controller,
} = await import("../../../src/controllers/statements.js");

const testId = "11111111-1111-4111-8111-111111111111";

describe("statements controller", () => {
  describe("addStatement_controller", () => {
    test("calls addStatement_model with the correct parameters", async () => {
      const mockStatement = { content: "Test statement" };
      addStatement_model.mockResolvedValue([1]);

      const result = await addStatement_controller(mockStatement);
      expect(addStatement_model).toHaveBeenCalledWith(mockStatement);
      expect(addStatement_model).toHaveBeenCalledTimes(1);
      expect(result).toEqual([1]);
    });
    test("throws an error when addStatement_model throws an error", async () => {
      const mockStatement = { content: "Test statement" };
      addStatement_model.mockRejectedValue(new Error("Database error"));

      await expect(addStatement_controller(mockStatement)).rejects.toThrow(
        "Database error",
      );
      expect(addStatement_model).toHaveBeenCalledWith(mockStatement);
    });
  });
  describe("getStatementById_controller", () => {
    test("calls getStatementById_model with the correct parameters", async () => {
      const mockStatement = { id: testId, content: "Test statement" };
      getStatementById_model.mockResolvedValue(mockStatement);

      const result = await getStatementById_controller(testId);
      expect(getStatementById_model).toHaveBeenCalledWith(testId);
      expect(getStatementById_model).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStatement);
    });
    test("throws an error when getStatementById_model throws an error", async () => {
      getStatementById_model.mockRejectedValue(new Error("Database error"));

      await expect(getStatementById_controller(testId)).rejects.toThrow(
        "Database error",
      );
      expect(getStatementById_model).toHaveBeenCalledWith(testId);
    });
  });
  describe("listStatements_controller", () => {
    test("calls listStatements_model and returns the result", async () => {
      // Mock the model response so this test stays focused on controller orchestration only.
      const mockStatements = [
        { id: "1", content: "Statement 1" },
        { id: "2", content: "Statement 2" },
      ];
      listStatements_model.mockResolvedValue(mockStatements);

      // The controller should delegate to the model and forward the resolved value unchanged.
      const result = await listStatements_controller();

      // This confirms the controller does not add parameters, transform the payload, or skip the model call.
      expect(listStatements_model).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStatements);
    });
    test("throws an error when listStatements_model throws an error", async () => {
      // Force a model failure so the test covers the controller's error propagation path.
      listStatements_model.mockRejectedValue(new Error("Database error"));

      // The route layer relies on the controller to reject when the underlying read fails.
      await expect(listStatements_controller()).rejects.toThrow(
        "Database error",
      );

      // Even in the failure case, the controller should still have attempted the model call once.
      expect(listStatements_model).toHaveBeenCalledTimes(1);
    });
  });
  describe("updateStatement_controller", () => {
    test("calls updateStatement_model with the correct parameters", async () => {
      const updateData = { content: "Updated content" };
      const mockUpdatedStatement = { id: testId, content: "Updated content" };
      updateStatement_model.mockResolvedValue(mockUpdatedStatement);

      const result = await updateStatement_controller(testId, updateData);
      expect(updateStatement_model).toHaveBeenCalledWith(testId, updateData);
      expect(result).toEqual(mockUpdatedStatement);
    });
    test("throws an error when updateStatement_model throws an error", async () => {
      const updateData = { content: "Updated content" };
      updateStatement_model.mockRejectedValue(new Error("Database error"));

      await expect(
        updateStatement_controller(testId, updateData),
      ).rejects.toThrow("Database error");
      expect(updateStatement_model).toHaveBeenCalledWith(testId, updateData);
    });
  });
  describe("deleteStatement_controller", () => {
    test("calls deleteStatement_model with the correct parameters", async () => {
      const mockDeletedStatement = { id: testId, content: "Deleted content" };
      deleteStatement_model.mockResolvedValue(mockDeletedStatement);

      const result = await deleteStatement_controller(testId);
      expect(deleteStatement_model).toHaveBeenCalledWith(testId);
      expect(result).toEqual(mockDeletedStatement);
    });
    test("throws an error when deleteStatement_model throws an error", async () => {
      deleteStatement_model.mockRejectedValue(new Error("Database error"));

      await expect(deleteStatement_controller(testId)).rejects.toThrow(
        "Database error",
      );
      expect(deleteStatement_model).toHaveBeenCalledWith(testId);
    });
  });
});
