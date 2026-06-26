import { jest } from "@jest/globals"
const mockVerify = jest.fn();
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { verify: mockVerify },
}));
const { authenticateToken, requireAdmin } = await import(
  "../../../src/middlewares/auth.js"
);
process.env.ACCESS_TOKEN_SECRET = "test-secret";

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("auth middleware", () => {
  describe("authenticateToken", () => {
    test.todo("returns 401 when Authorization header is missing");
    test.todo("returns 401 when Authorization header has no bearer token");
    test.todo("calls jwt.verify with HS256 algorithm and ACCESS_TOKEN_SECRET");
    test.todo("sets req.user to decoded token payload on valid token");
    test.todo("sets req.userId from decoded payload id when present");
    test.todo("falls back to decoded payload userId when id is missing");
    test.todo("calls next on successful token verification");
    test.todo("returns 403 when token verification fails");
  });

  describe("requireAdmin", () => {
    test.todo("returns 403 when req.user is missing");
    test.todo("returns 403 when req.user.role is not admin");
    test.todo("calls next when req.user.role is admin");
  });
});
