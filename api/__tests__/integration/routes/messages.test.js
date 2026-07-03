import { jest } from "@jest/globals";
import request from "supertest";
import testDb from "../../setup/testDb.js";
import { buildTestApp, makeFakeIo } from "../../setup/testApp.js";
import { seedUser, seedRumble, makeToken } from "../../setup/factories.js";

// Importing testApp.js registers the db (-> testDb) and swagger mocks.
// Moderation is the one other external boundary — mock it so no OpenAI calls happen.
jest.unstable_mockModule("../../../src/services/moderation.js", () => ({
  moderateContent: jest.fn(),
}));

const { moderateContent } = await import(
  "../../../src/services/moderation.js"
);

const io = makeFakeIo();
const app = await buildTestApp({ io });

beforeEach(async () => {
  jest.clearAllMocks();
  moderateContent.mockResolvedValue({ flagged: false, results: [] });

  // Delete children before parents to respect foreign keys.
  await testDb("messages").del();
  await testDb("rumbles").del();
  await testDb("rumble_requests").del();
  await testDb("blocks").del();
  await testDb("users").del();
});

async function seedRumbleWithParticipants() {
  const requester = await seedUser(testDb);
  const receiver = await seedUser(testDb);
  const rumble = await seedRumble(testDb, {
    requester_id: requester.id,
    receiver_id: receiver.id,
  });
  return { requester, receiver, rumble };
}

describe("messages integration routes", () => {
  describe("GET /api/rumbles/:id/messages", () => {
    test("returns messages for a participant, oldest first", async () => {
      const { requester, receiver, rumble } =
        await seedRumbleWithParticipants();
      await testDb("messages").insert([
        {
          rumble_id: rumble.id,
          sender_id: receiver.id,
          content: "Second message",
          sent_at: "2026-07-01T10:05:00.000Z",
        },
        {
          rumble_id: rumble.id,
          sender_id: requester.id,
          content: "First message",
          sent_at: "2026-07-01T10:00:00.000Z",
        },
      ]);

      const response = await request(app)
        .get(`/api/rumbles/${rumble.id}/messages`)
        .set("Authorization", `Bearer ${makeToken(requester)}`);

      expect(response.status).toBe(200);
      expect(response.body.data.map((m) => m.content)).toEqual([
        "First message",
        "Second message",
      ]);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
      });
    });

    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns 400 when the rumble id is not a valid UUID");
    test.todo("returns 404 when the rumble does not exist");
    test.todo("returns 403 when the user is not a participant");
    test.todo("respects page and limit query parameters");
  });

  describe("POST /api/rumbles/:id/messages", () => {
    test("creates a message, stores it, and emits the socket event", async () => {
      const { requester, rumble } = await seedRumbleWithParticipants();

      const response = await request(app)
        .post(`/api/rumbles/${rumble.id}/messages`)
        .set("Authorization", `Bearer ${makeToken(requester)}`)
        .send({ content: "First message" });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        rumble_id: rumble.id,
        sender_id: requester.id,
        content: "First message",
      });

      const rows = await testDb("messages").where({ rumble_id: rumble.id });
      expect(rows).toHaveLength(1);
      expect(rows[0].content).toBe("First message");

      expect(moderateContent).toHaveBeenCalledWith(["First message"]);
      expect(io.to).toHaveBeenCalledWith(`rumble:${rumble.id}`);
      expect(io.emit).toHaveBeenCalledWith("rumble:message", {
        type: "rumble:message",
        data: response.body,
      });
    });

    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns 400 when content is missing or empty");
    test.todo("returns 404 when the rumble does not exist");
    test.todo("returns 403 when the user is not a participant");
    test.todo("returns 403 when the rumble is terminated");
    test.todo("returns 403 when a block exists between the participants");
    test.todo("returns 422 when moderation flags the content");
  });
});