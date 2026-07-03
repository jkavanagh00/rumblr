import { expect, jest } from "@jest/globals";

// Mock the moderation service so no real OpenAI call is made; only the
// middleware logic (the gate) is under test here.
const mockModerateContent = jest.fn();

jest.unstable_mockModule("../../../src/services/moderation.js", () => ({
  moderateContent: mockModerateContent,
}));

const { moderateBody } = await import("../../../src/middlewares/moderation.js");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("moderation middleware", () => {
  describe("moderateBody", () => {
    test("returns 422 and does not call next when content is flagged", async () => {
      mockModerateContent.mockResolvedValue({ flagged: true, results: [] });
      const req = { validatedBody: { content: "some harmful text" } };
      const res = createMockRes();
      const next = jest.fn();

      await moderateBody("content")(req, res, next);

      expect(mockModerateContent).toHaveBeenCalledWith(["some harmful text"]);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: "This content violates our community guidelines",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next with no arguments when content is not flagged", async () => {
      mockModerateContent.mockResolvedValue({ flagged: false, results: [] });
      const req = { validatedBody: { content: "a safe message" } };
      const res = createMockRes();
      const next = jest.fn();

      await moderateBody("content")(req, res, next);

      expect(mockModerateContent).toHaveBeenCalledWith(["a safe message"]);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("collects every named field and passes them all to the service", async () => {
      mockModerateContent.mockResolvedValue({ flagged: false, results: [] });
      const req = { validatedBody: { username: "alice", bio: "hello world" } };
      const res = createMockRes();
      const next = jest.fn();

      await moderateBody("username", "bio")(req, res, next);

      expect(mockModerateContent).toHaveBeenCalledWith([
        "alice",
        "hello world",
      ]);
      expect(next).toHaveBeenCalledWith();
    });

    test("skips the service and calls next when there are no valid fields", async () => {
      const req = { validatedBody: { content: "   " } };
      const res = createMockRes();
      const next = jest.fn();

      await moderateBody("content")(req, res, next);

      expect(mockModerateContent).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("filters out non-string and empty fields before calling the service", async () => {
      mockModerateContent.mockResolvedValue({ flagged: false, results: [] });
      const req = {
        validatedBody: { username: "keep", bio: "" },
      };
      const res = createMockRes();
      const next = jest.fn();

      await moderateBody("username", "bio")(req, res, next);

      expect(mockModerateContent).toHaveBeenCalledWith(["keep"]);
      expect(next).toHaveBeenCalledWith();
    });

    test("fails open (calls next) when the moderation service throws", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockModerateContent.mockRejectedValue(new Error("service unavailable"));
      const req = { validatedBody: { content: "any text" } };
      const res = createMockRes();
      const next = jest.fn();

      await moderateBody("content")(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
