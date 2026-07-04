import request from "supertest";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { buildTestApp, makeFakeIo } from "../../setup/testApp.js";

const io = makeFakeIo();
const app = await buildTestApp({ io });

describe("testApp harness smoke test", () => {
  test("real auth middleware rejects a missing token with 401", async () => {
    const res = await request(app).get("/api/rumbles");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      error: "Access denied. No token provided.",
    });
  });

  test("real auth middleware rejects a bad token with 403", async () => {
    const res = await request(app)
      .get("/api/rumbles")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "Invalid or expired token." });
  });

  test("valid token reaches the real controller and queries testDb", async () => {
    const token = jwt.sign(
      { id: randomUUID() },
      process.env.ACCESS_TOKEN_SECRET,
      { algorithm: "HS256" },
    );
    const res = await request(app)
      .get("/api/rumbles")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});