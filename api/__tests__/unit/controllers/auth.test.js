import { expect, jest } from "@jest/globals";
import { sign } from "jsonwebtoken";

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
  jest.resetAllMocks();
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
    test("uses provided threat_levels when creating a user", async () => {
      const req = {
        validatedBody: {
          email: "email@address.com",
          username: "testuser",
          password: "password123",
          threat_levels: ["red", "orange"],
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByEmail_model.mockResolvedValue(null);
      findUserByUsername_model.mockResolvedValue(null);
      createUser_model.mockResolvedValue({
        id: "123",
        username: "testuser",
        email: "email@address.com",
        password_hash: "hashed",
        role: "user",
        threat_levels: ["red", "orange"],
      });
      await signup_controller(req, res, next);
      expect(createUser_model).toHaveBeenCalledWith(
        expect.objectContaining({ threat_levels: ["red", "orange"] }),
      );
    });
    test("creates a user with hashed password and nullable bio, then returns 201 with accessToken and user payload", async () => {
      const req = {
        validatedBody: {
          email: "email@address.com",
          username: "testuser",
          password: "password123",
          threat_levels: ["red", "orange"],
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByEmail_model.mockResolvedValue(null);
      findUserByUsername_model.mockResolvedValue(null);
      hashPassword.mockResolvedValue("hashed_password_123");
      createUser_model.mockResolvedValue({
        id: "123",
        username: "testuser",
        email: "email@address.com",
        password_hash: "hashed_password_123",
        role: "user",
        threat_levels: ["red", "orange"],
      });
      mockSign.mockReturnValue("fake-jwt-token");

      await signup_controller(req, res, next);

      expect(createUser_model).toHaveBeenCalledWith(
        expect.objectContaining({
          password_hash: "hashed_password_123",
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "fake-jwt-token",
        user: {
          id: "123",
          username: "testuser",
          role: "user",
          threat_levels: ["red", "orange"],
        },
      });
    });
    test("forwards an error to next when ACCESS_TOKEN_SECRET is missing during token generation", async () => {
      delete process.env.ACCESS_TOKEN_SECRET;
      const req = {
        validatedBody: {
          email: "email@address.com",
          username: "testuser",
          password: "password123",
          threat_levels: ["red", "orange"],
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByEmail_model.mockResolvedValue(null);
      findUserByUsername_model.mockResolvedValue(null);

      await signup_controller(req, res, next);
      process.env.ACCESS_TOKEN_SECRET = "test-secret";
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    test("forwards model or helper errors to next", async () => {
      const req = {
        validatedBody: {
          email: "email@address.com",
          username: "testuser",
          password: "password123",
          threat_levels: ["red", "orange"],
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByEmail_model.mockResolvedValue(null);
      findUserByUsername_model.mockResolvedValue(null);
      const error = new Error("db error");
      findUserByEmail_model.mockRejectedValue(error);
      await signup_controller(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("login_controller", () => {
    test("uses email lookup when identifier contains @ and returns 401 for unknown account", async () => {
      const req = {
        validatedBody: {
          identifier: "email@address.com",
          password: "password_123",
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByEmail_model.mockResolvedValue(null);

      await login_controller(req, res, next);

      expect(findUserByEmail_model).toHaveBeenCalledWith("email@address.com");
      expect(findUserByUsername_model).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });
    test("uses username lookup when identifier does not contain @ and returns 401 for unknown account", async () => {
      const req = {
        validatedBody: {
          identifier: "username",
          password: "password_123",
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByUsername_model.mockResolvedValue(null);

      await login_controller(req, res, next);

      expect(findUserByUsername_model).toHaveBeenCalledWith("username");
      expect(findUserByEmail_model).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
    });
    test("returns 401 when password verification fails for an existing account", async () => {
      const req = {
        validatedBody: {
          identifier: "username",
          password: "password_123",
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByUsername_model.mockResolvedValue({
        id: 1,
        username: "username",
        password_hash: "hashed_password_123",
      });
      verifyPassword.mockResolvedValue(false);

      await login_controller(req, res, next);

      expect(findUserByUsername_model).toHaveBeenCalledWith("username");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid credentials" });
      expect(verifyPassword).toHaveBeenCalledWith(
        "password_123",
        "hashed_password_123",
      );
    });
    test("returns 200 with accessToken and public user fields when credentials are valid", async () => {
      const req = {
        validatedBody: {
          identifier: "username",
          password: "password_123",
        },
      };
      const res = createMockRes();
      const next = jest.fn();
      findUserByUsername_model.mockResolvedValue({
        id: 1,
        username: "username",
        password_hash: "hashed_password_123",
      });
      verifyPassword.mockResolvedValue(true);
      mockSign.mockReturnValue("fake-jwt-token");

      await login_controller(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        accessToken: "fake-jwt-token",
        user: {
          id: 1,
          username: "username",
        },
      });
    });
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
