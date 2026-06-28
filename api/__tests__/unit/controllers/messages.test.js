import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/messages.js", () => ({
  addMessage_model: jest.fn(),
  getMessagesByRumbleId_model: jest.fn(),
}));

jest.unstable_mockModule("../../../src/models/rumbles.js", () => ({
  getRumbleById_model: jest.fn(),
  isUserParticipantInRumble_model: jest.fn(),
}));

const { addMessage_model, getMessagesByRumbleId_model } = await import(
  "../../../src/models/messages.js"
);
const { getRumbleById_model, isUserParticipantInRumble_model } = await import(
  "../../../src/models/rumbles.js"
);
const { addMessage_controller, getMessages_controller } = await import(
  "../../../src/controllers/messages.js"
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

describe("messages controller", () => {
  describe("addMessage_controller", () => {
    test("returns 404 when rumble cannot be found", async () => {
      const req = {
        params: { id: "11111111-1111-4111-8111-111111111111" },
        user: { id: "22222222-2222-4222-8222-222222222222" },
        validatedBody: { content: "Hello" },
        app: { get: jest.fn().mockReturnValue(undefined) },
      };
      const res = createMockRes();
      const next = jest.fn();

      getRumbleById_model.mockResolvedValue(undefined);

      await addMessage_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Rumble not found" });
      expect(isUserParticipantInRumble_model).not.toHaveBeenCalled();
      expect(addMessage_model).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 403 when user is not a participant", async () => {
      const rumbleId = "11111111-1111-4111-8111-111111111111";
      const req = {
        params: { id: rumbleId },
        user: { id: "22222222-2222-4222-8222-222222222222" },
        validatedBody: { content: "Hello" },
        app: { get: jest.fn().mockReturnValue(undefined) },
      };
      const res = createMockRes();
      const next = jest.fn();

      getRumbleById_model.mockResolvedValue({
        id: rumbleId,
        status: "active",
      });
      isUserParticipantInRumble_model.mockResolvedValue(false);

      await addMessage_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "You are not a participant in this rumble",
      });
      expect(addMessage_model).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    // todoTest("Add tests for addMessage_controller when rumble is terminated.");

    test("creates message and emits socket event for an active rumble", async () => {
      const rumbleId = "11111111-1111-4111-8111-111111111111";
      const userId = "22222222-2222-4222-8222-222222222222";
      const io = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
      const req = {
        params: { id: rumbleId },
        user: { id: userId },
        validatedBody: {
          rumble_id: rumbleId,
          sender_id: userId,
          content: "First message",
        },
        app: { get: jest.fn().mockReturnValue(io) },
      };
      const res = createMockRes();
      const next = jest.fn();
      const message = {
        id: "33333333-3333-4333-8333-333333333333",
        rumble_id: rumbleId,
        sender_id: userId,
        content: "First message",
      };

      getRumbleById_model.mockResolvedValue({
        id: rumbleId,
        status: "active",
      });
      isUserParticipantInRumble_model.mockResolvedValue(true);
      addMessage_model.mockResolvedValue(message);

      await addMessage_controller(req, res, next);

      expect(addMessage_model).toHaveBeenCalledWith(req.validatedBody);
      expect(io.to).toHaveBeenCalledWith(`rumble:${rumbleId}`);
      expect(io.to().emit).toHaveBeenCalledWith("rumble:message", {
        type: "rumble:message",
        data: message,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(message);
      expect(next).not.toHaveBeenCalled();
    });

    test("does not update status when rumble is already active", async () => {
      const rumbleId = "11111111-1111-4111-8111-111111111111";
      const userId = "22222222-2222-4222-8222-222222222222";
      const req = {
        params: { id: rumbleId },
        user: { id: userId },
        validatedBody: {
          rumble_id: rumbleId,
          sender_id: userId,
          content: "Another message",
        },
        app: { get: jest.fn().mockReturnValue(undefined) },
      };
      const res = createMockRes();
      const next = jest.fn();
      const message = {
        id: "33333333-3333-4333-8333-333333333333",
        rumble_id: rumbleId,
        sender_id: userId,
        content: "Another message",
      };

      getRumbleById_model.mockResolvedValue({ id: rumbleId, status: "active" });
      isUserParticipantInRumble_model.mockResolvedValue(true);
      addMessage_model.mockResolvedValue(message);

      await addMessage_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(message);
      expect(next).not.toHaveBeenCalled();
    });

    test("passes errors to next", async () => {
      const req = {
        params: { id: "11111111-1111-4111-8111-111111111111" },
        user: { id: "22222222-2222-4222-8222-222222222222" },
        validatedBody: { content: "Hello" },
        app: { get: jest.fn().mockReturnValue(undefined) },
      };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("Database error");

      getRumbleById_model.mockRejectedValue(error);

      await addMessage_controller(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMessages_controller", () => {
    test("returns 404 when rumble cannot be found", async () => {
      const req = {
        params: { id: "11111111-1111-4111-8111-111111111111" },
        validatedQuery: { page: 1, limit: 20 },
        user: { id: "22222222-2222-4222-8222-222222222222" },
      };
      const res = createMockRes();
      const next = jest.fn();

      getRumbleById_model.mockResolvedValue(undefined);

      await getMessages_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Rumble not found" });
      expect(getMessagesByRumbleId_model).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 403 when user is not a participant", async () => {
      const rumbleId = "11111111-1111-4111-8111-111111111111";
      const userId = "22222222-2222-4222-8222-222222222222";
      const req = {
        params: { id: rumbleId },
        validatedQuery: { page: 1, limit: 20 },
        user: { id: userId },
      };
      const res = createMockRes();
      const next = jest.fn();

      getRumbleById_model.mockResolvedValue({ id: rumbleId, status: "active" });
      isUserParticipantInRumble_model.mockResolvedValue(false);

      await getMessages_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "You are not a participant in this rumble",
      });
      expect(getMessagesByRumbleId_model).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test.todo(
      "Add tests for getMessages_controller when rumble is terminated.",
    );

    test("returns paginated messages for rumble", async () => {
      const rumbleId = "11111111-1111-4111-8111-111111111111";
      const userId = "22222222-2222-4222-8222-222222222222";
      const req = {
        params: { id: rumbleId },
        validatedQuery: { page: 2, limit: 5 },
        user: { id: userId },
      };
      const res = createMockRes();
      const next = jest.fn();
      const modelResult = {
        data: [{ id: "33333333-3333-4333-8333-333333333333", content: "Hey" }],
        pagination: { page: 2, limit: 5 },
      };

      getRumbleById_model.mockResolvedValue({ id: rumbleId, status: "active" });
      isUserParticipantInRumble_model.mockResolvedValue(true);
      getMessagesByRumbleId_model.mockResolvedValue(modelResult);

      await getMessages_controller(req, res, next);

      expect(getMessagesByRumbleId_model).toHaveBeenCalledWith(rumbleId, {
        page: 2,
        limit: 5,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(modelResult);
      expect(next).not.toHaveBeenCalled();
    });

    test("passes errors to next", async () => {
      const req = {
        params: { id: "11111111-1111-4111-8111-111111111111" },
        validatedQuery: { page: 1, limit: 20 },
        user: { id: "22222222-2222-4222-8222-222222222222" },
      };
      const res = createMockRes();
      const next = jest.fn();
      const error = new Error("Database error");

      getRumbleById_model.mockRejectedValue(error);

      await getMessages_controller(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
