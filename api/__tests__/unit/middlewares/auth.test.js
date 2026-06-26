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
    test("returns 401 when Authorization header is missing", async () => {
		const req = { headers: {} };
		const res = createMockRes();
		const next = jest.fn();

		const result = await authenticateToken(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
		expect(next).not.toHaveBeenCalled();
	});
    test("returns 401 when Authorization header has no bearer token", async () => {
		const req = { headers: {
			authorization: "invalidToken"
		}};
		const res = createMockRes();
		const next = jest.fn();
		
		await authenticateToken(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: "Access denied. No token provided." });
		expect(next).not.toHaveBeenCalled();
	});
    test("calls jwt.verify with HS256 algorithm and ACCESS_TOKEN_SECRET", async () => {
		const req = {
			headers: {
				authorization: "Bearer thisIsAToken"
			}
		};
		const res = createMockRes();
		const next = jest.fn();

		mockVerify.mockReturnValue({ id: "123" });
		await authenticateToken(req, res, next);

		expect(mockVerify).toHaveBeenCalledWith("thisIsAToken", "test-secret", { algorithms: ["HS256"]});
	});
    test("sets req.user to decoded token payload on valid token", async () => {
		const req = {
			headers: {
				authorization: "Bearer thisIsAToken"
			}
		};
		const res = createMockRes();
		const next = jest.fn();

		mockVerify.mockReturnValue({ id: "123", role: "user"});
		await authenticateToken(req, res, next);

		expect(req.user).toEqual({
			id: "123",
			role: "user",
		});
	});
    test("falls back to decoded payload userId when id is missing", async () => {
		const req = {
			headers: {
				authorization: "Bearer thisIsAToken"
			},
		};
		const res = createMockRes();
		const next = jest.fn();

		mockVerify.mockReturnValue({ userId: "123", role: "user"});
		await authenticateToken(req, res, next);

		expect(req.userId).toBe("123");
	});
    test.todo("calls next on successful token verification");
    test.todo("returns 403 when token verification fails");
  });

  describe("requireAdmin", () => {
    test.todo("returns 403 when req.user is missing");
    test.todo("returns 403 when req.user.role is not admin");
    test.todo("calls next when req.user.role is admin");
  });
});
