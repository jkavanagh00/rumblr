import { jest } from "@jest/globals";

// Mock the OpenAI SDK so no real network calls are made.
const mockCreate = jest.fn();
const OpenAIMock = jest.fn().mockImplementation(() => ({
  moderations: { create: mockCreate },
}));

jest.unstable_mockModule("openai", () => ({
  default: OpenAIMock,
}));

const { moderateContent } = await import("../../../src/services/moderation.js");

const ORIGINAL_MODERATION_ENABLED = process.env.MODERATION_ENABLED;

beforeEach(() => {
  mockCreate.mockReset();
  OpenAIMock.mockClear();
  process.env.MODERATION_ENABLED = "true";
});

afterAll(() => {
  process.env.MODERATION_ENABLED = ORIGINAL_MODERATION_ENABLED;
});

describe("moderateContent", () => {
  describe("when moderation is disabled", () => {
    test("returns not flagged and does not call the OpenAI API", async () => {
      process.env.MODERATION_ENABLED = "false";

      const result = await moderateContent("some text");

      expect(result).toEqual({ flagged: false, results: [] });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    test("treats any value other than the string 'true' as disabled", async () => {
      process.env.MODERATION_ENABLED = "1";

      const result = await moderateContent("some text");

      expect(result).toEqual({ flagged: false, results: [] });
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe("input filtering", () => {
    test("returns not flagged without calling the API when there are no valid texts", async () => {
      const result = await moderateContent(["", "   ", 42, null, undefined]);

      expect(result).toEqual({ flagged: false, results: [] });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    test("wraps a single string input into an array for the API call", async () => {
      mockCreate.mockResolvedValue({ results: [{ flagged: false }] });

      await moderateContent("hello");

      expect(mockCreate).toHaveBeenCalledWith({
        model: "omni-moderation-latest",
        input: ["hello"],
      });
    });

    test("filters out empty, whitespace-only, and non-string entries before calling the API", async () => {
      mockCreate.mockResolvedValue({ results: [{ flagged: false }] });

      await moderateContent(["  keep me  ", "", "   ", 7, {}, "also keep"]);

      expect(mockCreate).toHaveBeenCalledWith({
        model: "omni-moderation-latest",
        input: ["  keep me  ", "also keep"],
      });
    });
  });

  describe("when moderation is enabled", () => {
    test("returns flagged true when any result is flagged", async () => {
      mockCreate.mockResolvedValue({
        results: [{ flagged: false }, { flagged: true }],
      });

      const result = await moderateContent(["safe", "harmful"]);

      expect(result.flagged).toBe(true);
      expect(result.results).toHaveLength(2);
    });

    test("returns flagged false when no result is flagged", async () => {
      mockCreate.mockResolvedValue({
        results: [{ flagged: false }, { flagged: false }],
      });

      const result = await moderateContent(["safe", "also safe"]);

      expect(result.flagged).toBe(false);
      expect(result.results).toHaveLength(2);
    });

    test("defaults results to an empty array when the API omits them", async () => {
      mockCreate.mockResolvedValue({});

      const result = await moderateContent("text");

      expect(result).toEqual({ flagged: false, results: [] });
    });

    test("propagates errors thrown by the OpenAI API", async () => {
      mockCreate.mockRejectedValue(new Error("rate limited"));

      await expect(moderateContent("text")).rejects.toThrow("rate limited");
    });
  });
});
