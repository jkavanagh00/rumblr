import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/rumbles.js", () => ({
  addRumble_model: jest.fn(),
  getRumblesByUserId_model: jest.fn(),
  getRumbleById_model: jest.fn(),
  isUserParticipantInRumble_model: jest.fn(),
  terminateRumble_model: jest.fn(),
}));

const { addRumble_model, getRumblesByUserId_model } = await import(
  "../../../src/models/rumbles.js"
);
const { addRumble_controller, getRumbles_controller } = await import(
  "../../../src/controllers/rumbles.js"
);

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("rumbles controller", () => {
  describe("getRumbles_controller", () => {
    test("returns 200 with active rumbles for user", async () => {
      const userId = "22222222-2222-4222-8222-222222222222";
      const req = { user: { id: userId } };
      const res = createMockRes();
      const next = jest.fn();
      const rumbles = {
        data: [{ id: "55555555-5555-4555-8555-555555555555" }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      getRumblesByUserId_model.mockResolvedValue(rumbles);

      await getRumbles_controller(req, res, next);

      expect(getRumblesByUserId_model).toHaveBeenCalledWith(userId, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(rumbles);
      expect(next).not.toHaveBeenCalled();
    });

    test("passes errors to next", async () => {
      const req = { user: { id: "22222222-2222-4222-8222-222222222222" } };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("Database error");

      getRumblesByUserId_model.mockRejectedValue(error);

      await getRumbles_controller(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
  // todo("Add terminateRumble_controller unit tests (401, 404, 403, and success)");
});
