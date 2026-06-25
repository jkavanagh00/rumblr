import testDb from "../../setup/testDb.js";
import { seedUser } from "../../setup/factories.js";
import {
  addMessage_model,
  getMessagesByRumbleId_model,
} from "../../../src/models/messages.js";

const userId = "11111111-1111-4111-8111-111111111111";
const otherUserId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";
const rumbleId = "44444444-4444-4444-8444-444444444444";
const otherRumbleId = "55555555-5555-4555-8555-555555555555";

async function seedRumbleRequest(overrides = {}) {
  const data = {
    id: requestId,
    requester_id: userId,
    receiver_id: otherUserId,
    status: "accepted",
    ...overrides,
  };

  await testDb("rumble_requests").insert(data);
  return data;
}

async function seedRumble(overrides = {}) {
  const data = {
    id: rumbleId,
    rumble_request_id: requestId,
    requester_id: userId,
    receiver_id: otherUserId,
    status: "active",
    ...overrides,
  };

  await testDb("rumbles").insert(data);
  return data;
}

describe("messages model", () => {
  beforeEach(async () => {
    await testDb("messages").del();
    await testDb("rumbles").del();
    await testDb("rumble_requests").del();
    await testDb("users").del();
  });

  describe("addMessage_model", () => {
    test("inserts and returns a message", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();
      await seedRumble();

      const payload = {
        rumble_id: rumbleId,
        sender_id: userId,
        content: "Hello rumble",
      };

      const result = await addMessage_model(payload, testDb);
      const saved = await testDb("messages").where({ id: result.id }).first();

      expect(result.rumble_id).toBe(rumbleId);
      expect(result.sender_id).toBe(userId);
      expect(result.content).toBe("Hello rumble");
      expect(saved.content).toBe("Hello rumble");
    });

    test("throws when required fields are missing", async () => {
      await expect(
        addMessage_model({ content: "No ids" }, testDb),
      ).rejects.toThrow();
    });
  });

  describe("getMessagesByRumbleId_model", () => {
    test("returns messages only for the requested rumble", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();
      await seedRumble();

      await seedRumbleRequest({ id: "66666666-6666-4666-8666-666666666666" });
      await seedRumble({
        id: otherRumbleId,
        rumble_request_id: "66666666-6666-4666-8666-666666666666",
      });

      await addMessage_model(
        { rumble_id: rumbleId, sender_id: userId, content: "m1" },
        testDb,
      );
      await addMessage_model(
        { rumble_id: rumbleId, sender_id: otherUserId, content: "m2" },
        testDb,
      );
      await addMessage_model(
        { rumble_id: otherRumbleId, sender_id: userId, content: "other" },
        testDb,
      );

      const result = await getMessagesByRumbleId_model(
        rumbleId,
        { page: 1, limit: 20 },
        testDb,
      );

      expect(result.pagination).toEqual({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(2);
      expect(result.data.every((row) => row.rumble_id === rumbleId)).toBe(true);
    });

    test("applies pagination correctly", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();
      await seedRumble();

      await addMessage_model(
        { rumble_id: rumbleId, sender_id: userId, content: "m1" },
        testDb,
      );
      await addMessage_model(
        { rumble_id: rumbleId, sender_id: userId, content: "m2" },
        testDb,
      );
      await addMessage_model(
        { rumble_id: rumbleId, sender_id: userId, content: "m3" },
        testDb,
      );

      const page1 = await getMessagesByRumbleId_model(
        rumbleId,
        { page: 1, limit: 2 },
        testDb,
      );
      const page2 = await getMessagesByRumbleId_model(
        rumbleId,
        { page: 2, limit: 2 },
        testDb,
      );

      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(1);
      expect(page1.pagination).toEqual({ page: 1, limit: 2 });
      expect(page2.pagination).toEqual({ page: 2, limit: 2 });
    });

    test("returns empty list when rumble has no messages", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();
      await seedRumble();

      const result = await getMessagesByRumbleId_model(
        rumbleId,
        { page: 1, limit: 20 },
        testDb,
      );

      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({ page: 1, limit: 20 });
    });
  });
});
