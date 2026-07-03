import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const testUserId = "11111111-1111-4111-8111-111111111111";
const rumbleId = "22222222-2222-4222-8222-222222222222";

jest.unstable_mockModule("../../../src/middlewares/auth.js", () => ({
  authenticateToken: jest.fn((req, _res, next) => {
    req.user = { id: testUserId };
    next();
  }),
}));

jest.unstable_mockModule("../../../src/controllers/rumbles.js", () => ({
  addRumble_controller: jest.fn(),
  getRumbles_controller: jest.fn(),
  terminateRumble_controller: jest.fn(),
}));

jest.unstable_mockModule("../../../src/controllers/messages.js", () => ({
  addMessage_controller: jest.fn(),
  getMessages_controller: jest.fn(),
}));

const { addMessage_controller, getMessages_controller } = await import(
  "../../../src/controllers/messages.js"
);
const { default: rumblesRouter } = await import(
  "../../../src/routes/rumbles.js"
);

const app = express();
app.use(express.json());
app.use("/rumbles", rumblesRouter);
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("messages integration routes", () => {
  describe("GET /rumbles/:id/messages", () => {
    test("returns messages for a rumble", async () => {
      const payload = {
        data: [{ id: "55555555-5555-4555-8555-555555555555", content: "Hi" }],
        page: 1,
        limit: 20,
      };

      getMessages_controller.mockImplementation(async (_req, res) => {
        return res.status(200).json(payload);
      });

      const response = await request(app).get(`/rumbles/${rumbleId}/messages`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(payload);
      expect(getMessages_controller).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /rumbles/:id/messages", () => {
    test("creates and returns a message", async () => {
      const body = { content: "First message" };
      const created = {
        id: "66666666-6666-4666-8666-666666666666",
        rumble_id: rumbleId,
        sender_id: testUserId,
        content: "First message",
      };

      addMessage_controller.mockImplementation(async (_req, res) => {
        return res.status(201).json(created);
      });

      const response = await request(app)
        .post(`/rumbles/${rumbleId}/messages`)
        .send(body);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(created);
      expect(addMessage_controller).toHaveBeenCalledTimes(1);
    });
  });
});
