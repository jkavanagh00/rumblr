import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/rumbles.js", () => ({
  addRumble_model: jest.fn(),
  getActiveRumblesByUserId_model: jest.fn(),
}));

const { addRumble_model, getActiveRumblesByUserId_model } = await import(
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
  describe("addRumble_controller", () => {
    test("calls addRumble_model and returns 201", async () => {
      const req = {
        validatedBody: {
          rumble_request_id: "11111111-1111-4111-8111-111111111111",
          requester_id: "22222222-2222-4222-8222-222222222222",
          receiver_id: "33333333-3333-4333-8333-333333333333",
          status: "pending",
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      const created = {
        id: "44444444-4444-4444-8444-444444444444",
        ...req.validatedBody,
      };

      addRumble_model.mockResolvedValue(created);

      await addRumble_controller(req, res, next);

      expect(addRumble_model).toHaveBeenCalledWith(req.validatedBody);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(created);
      expect(next).not.toHaveBeenCalled();
    });

    test("passes errors to next", async () => {
      const req = { validatedBody: { status: "pending" } };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("Database error");

      addRumble_model.mockRejectedValue(error);

      await addRumble_controller(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getRumbles_controller", () => {
    test("returns 401 when userId is missing", async () => {
      const req = {};
      const res = createMockRes();
      const next = jest.fn();

      await getRumbles_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(getActiveRumblesByUserId_model).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 200 with active rumbles for user", async () => {
      const userId = "22222222-2222-4222-8222-222222222222";
      const req = { userId };
      const res = createMockRes();
      const next = jest.fn();
      const rumbles = [{ id: "55555555-5555-4555-8555-555555555555" }];

      getActiveRumblesByUserId_model.mockResolvedValue(rumbles);

      await getRumbles_controller(req, res, next);

      expect(getActiveRumblesByUserId_model).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: rumbles });
      expect(next).not.toHaveBeenCalled();
    });

    test("passes errors to next", async () => {
      const req = { userId: "22222222-2222-4222-8222-222222222222" };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("Database error");

      getActiveRumblesByUserId_model.mockRejectedValue(error);

      await getRumbles_controller(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
