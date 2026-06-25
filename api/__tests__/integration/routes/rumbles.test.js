import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

const testUserId = "11111111-1111-4111-8111-111111111111";
const rumbleId = "22222222-2222-4222-8222-222222222222";

jest.unstable_mockModule("../../../src/middlewares/auth.js", () => ({
  authenticateToken: jest.fn((req, _res, next) => {
    req.userId = testUserId;
    next();
  }),
}));

jest.unstable_mockModule("../../../src/controllers/rumbles.js", () => ({
  addRumble_controller: jest.fn(),
  getRumbles_controller: jest.fn(),
}));

jest.unstable_mockModule("../../../src/controllers/messages.js", () => ({
  addMessage_controller: jest.fn(),
  getMessages_controller: jest.fn(),
}));

const { addRumble_controller, getRumbles_controller } = await import(
  "../../../src/controllers/rumbles.js"
);
const { default: rumblesRouter } = await import("../../../src/routes/rumbles.js");

const app = express();
app.use(express.json());
app.use("/rumbles", rumblesRouter);
app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({ error: err.message });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("rumbles integration routes", () => {
  describe("GET /rumbles", () => {
    test("returns user rumbles", async () => {
      const payload = [{ id: rumbleId, status: "active" }];
      getRumbles_controller.mockImplementation(async (_req, res) => {
        return res.status(200).json({ data: payload });
      });

      const response = await request(app).get("/rumbles");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: payload });
      expect(getRumbles_controller).toHaveBeenCalledTimes(1);
    });

    test("returns 500 when the controller throws", async () => {
      getRumbles_controller.mockImplementation(async (_req, _res, next) => {
        next(new Error("Database error"));
      });

      const response = await request(app).get("/rumbles");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
      expect(getRumbles_controller).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /rumbles", () => {
    test.todo("returns 400 when threat_level is missing or invalid in rumble creation payload");

    test("creates and returns a rumble", async () => {
      const body = {
        rumble_request_id: "33333333-3333-4333-8333-333333333333",
        requester_id: testUserId,
        receiver_id: "44444444-4444-4444-8444-444444444444",
        status: "active",
        threat_level: "orange",
      };

      addRumble_controller.mockImplementation(async (_req, res) => {
        return res.status(201).json({ id: rumbleId, ...body });
      });

      const response = await request(app).post("/rumbles").send(body);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: rumbleId, ...body });
      expect(addRumble_controller).toHaveBeenCalledTimes(1);
    });
  });
});
