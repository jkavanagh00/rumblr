/**
 * Shared harness for route integration tests.
 *
 * Provides the real Express app from src/app.mjs with exactly two seams
 * replaced: the database singleton (swapped for the in-memory testDb) and
 * the swagger spec (stubbed to skip swagger-jsdoc's route-file scan).
 * Everything else — auth, validation, moderation middleware, controllers,
 * services, models — runs unmodified production code.
 */
import { jest } from "@jest/globals";
import testDb from "./testDb.js";

// Registered at module top level, so merely importing this file guarantees
// the mocks are in place before anything can load the real app graph.
jest.unstable_mockModule("../../src/database/db.js", () => ({
  default: testDb,
}));

jest.unstable_mockModule("../../src/config/swagger.js", () => ({
  default: {
    openapi: "3.0.0",
    info: { title: "test", version: "0" },
    paths: {},
  },
}));

export function makeFakeIo() {
  const io = { to: jest.fn(), emit: jest.fn() };
  io.to.mockReturnValue(io); // supports io.to(room).emit(...)
  return io;
}

/**
 * Build the app. Suite-specific mocks (e.g. services/moderation.js) must be
 * registered before calling this — app.mjs is imported dynamically here so
 * that all previously registered mocks apply.
 */
export async function buildTestApp({ io } = {}) {
  const { default: app } = await import("../../src/app.mjs");
  if (io) app.set("io", io);
  return app;
}