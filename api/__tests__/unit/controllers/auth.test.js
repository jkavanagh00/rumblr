import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/models/users.js", () => ({
  findUserByEmail_model: jest.fn(),
  findUserByUsername_model: jest.fn(),
  createUser_model: jest.fn(),
  getPublicUserById_model: jest.fn(),
}));

jest.unstable_mockModule("../../../src/utils/helpers", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
}));

const mockSign = jest.fn();
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: mockSign },
}));

const { signup_controller, login_controller, me_controller } = await import(
  "../../../src/controllers/auth.js"
);

process.env.ACCESS_TOKEN_SECRET = "test-secret";

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

const {
  createUser_model,
  findUserByEmail_model,
  findUserByUsername_model,
  getPublicUserById_model,
} = await import("../../../src/models/users");
const { hashPassword, verifyPassword } = await import(
  "../../../src/utils/helpers.js"
);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth controller", () => {
  describe("signup_controller", () => {
    test("returns 409 when an account already exists for the provided email", async () => {
      const req = {
        validatedBody: {
          email: "email@address.com",
          username: "testuser",
          password: "password123",
        },
      };

      const res = createMockRes();
      const next = jest.fn();
      findUserByEmail_model.mockResolvedValue({
        id: 1,
        email: "email@address.com",
      });
      await signup_controller(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
    });
    test("returns 409 when the username is already taken after email uniqueness passes", async () => {
      const req = {
        validatedBody: {
          email: "email@address.com",
          username: "testuser",
          password: "password123",
        },
      };

      const res = createMockRes();
      const next = jest.fn();
      findUserByUsername_model.mockResolvedValue({
        id: 1,
        username: "testuser",
      });
      await signup_controller(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
    });
    test.todo(
      "uses provided threat_levels or falls back to default [green] when creating a user",
    );
    test.todo(
      "creates a user with hashed password and nullable bio, then returns 201 with accessToken and user payload",
    );
    test.todo(
      "forwards an error to next when ACCESS_TOKEN_SECRET is missing during token generation",
    );
    test.todo("forwards model or helper errors to next");
  });

  describe("login_controller", () => {
    test.todo(
      "uses email lookup when identifier contains @ and returns 401 for unknown account",
    );
    test.todo(
      "uses username lookup when identifier does not contain @ and returns 401 for unknown account",
    );
    test.todo(
      "returns 401 when password verification fails for an existing account",
    );
    test.todo(
      "returns 200 with accessToken and public user fields when credentials are valid",
    );
    test.todo("removes password_hash from the returned user object");
    test.todo(
      "forwards an error to next when ACCESS_TOKEN_SECRET is missing during token generation",
    );
    test.todo("forwards model or helper errors to next");
  });

  describe("me_controller", () => {
    test.todo("uses req.user.id when available to load the current user");
    test.todo("falls back to req.userId when req.user.id is undefined");
    test.todo(
      "returns 404 when no public user exists for the resolved user id",
    );
    test.todo("returns 200 with the public user profile when found");
    test.todo("forwards model errors to next");
  });
});
