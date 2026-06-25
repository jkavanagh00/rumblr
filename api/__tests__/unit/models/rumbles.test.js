import testDb from "../../setup/testDb.js";
import { seedUser } from "../../setup/factories.js";
import {
  addRumble_model,
  getActiveRumblesByUserId_model,
  getRumbleById_model,
  updateRumbleStatus_model,
  isUserParticipantInRumble_model,
} from "../../../src/models/rumbles.js";

const userId = "22222222-2222-4222-8222-222222222222";
const otherUserId = "33333333-3333-4333-8333-333333333333";
const outsiderId = "44444444-4444-4444-8444-444444444444";
const requestId = "55555555-5555-4555-8555-555555555555";
const rumbleId = "66666666-6666-4666-8666-666666666666";

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

describe("rumbles model", () => {
  beforeEach(async () => {
    await testDb("messages").del();
    await testDb("rumbles").del();
    await testDb("rumble_requests").del();
    await testDb("users").del();
  });

  describe("addRumble_model", () => {
    test("inserts and returns a rumble", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();

      const rumbleData = {
        id: rumbleId,
        rumble_request_id: requestId,
        requester_id: userId,
        receiver_id: otherUserId,
        status: "inactive",
      };

      const result = await addRumble_model(rumbleData, testDb);
      const row = await testDb("rumbles").where({ id: rumbleId }).first();

      expect(result.id).toBe(rumbleId);
      expect(result.status).toBe("inactive");
      expect(row.requester_id).toBe(userId);
      expect(row.receiver_id).toBe(otherUserId);
    });
  });

  describe("getActiveRumblesByUserId_model", () => {
    test("returns only active rumbles where user participates", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedUser(testDb, { id: outsiderId });

      await seedRumbleRequest({
        id: requestId,
        requester_id: userId,
        receiver_id: otherUserId,
      });
      await seedRumbleRequest({
        id: "77777777-7777-4777-8777-777777777777",
        requester_id: outsiderId,
        receiver_id: otherUserId,
      });

      await testDb("rumbles").insert([
        {
          id: rumbleId,
          rumble_request_id: requestId,
          requester_id: userId,
          receiver_id: otherUserId,
          status: "active",
        },
        {
          id: "88888888-8888-4888-8888-888888888888",
          rumble_request_id: requestId,
          requester_id: userId,
          receiver_id: otherUserId,
          status: "inactive",
        },
        {
          id: "99999999-9999-4999-8999-999999999999",
          rumble_request_id: "77777777-7777-4777-8777-777777777777",
          requester_id: outsiderId,
          receiver_id: otherUserId,
          status: "active",
        },
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          rumble_request_id: requestId,
          requester_id: userId,
          receiver_id: otherUserId,
          status: "terminated",
        },
      ]);

      const result = await getActiveRumblesByUserId_model(userId, testDb);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(rumbleId);
      expect(result[0].status).toBe("active");
    });
  });

  describe("getRumbleById_model", () => {
    test("returns a rumble when found", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();

      await testDb("rumbles").insert({
        id: rumbleId,
        rumble_request_id: requestId,
        requester_id: userId,
        receiver_id: otherUserId,
        status: "inactive",
      });

      const result = await getRumbleById_model(rumbleId, testDb);

      expect(result.id).toBe(rumbleId);
      expect(result.status).toBe("inactive");
    });

    test("returns undefined when rumble does not exist", async () => {
      const result = await getRumbleById_model(rumbleId, testDb);
      expect(result).toBe(undefined);
    });
  });

  describe("updateRumbleStatus_model", () => {
    test("updates and returns rumble status", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();

      await testDb("rumbles").insert({
        id: rumbleId,
        rumble_request_id: requestId,
        requester_id: userId,
        receiver_id: otherUserId,
        status: "inactive",
      });

      const updated = await updateRumbleStatus_model(
        rumbleId,
        "active",
        testDb,
      );

      expect(updated.id).toBe(rumbleId);
      expect(updated.status).toBe("active");
    });

    test("returns undefined when rumble does not exist", async () => {
      const updated = await updateRumbleStatus_model(
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "active",
        testDb,
      );

      expect(updated).toBe(undefined);
    });
  });

  describe("isUserParticipantInRumble_model", () => {
    test("returns true when user is requester or receiver", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedRumbleRequest();

      await testDb("rumbles").insert({
        id: rumbleId,
        rumble_request_id: requestId,
        requester_id: userId,
        receiver_id: otherUserId,
        status: "active",
      });

      const asRequester = await isUserParticipantInRumble_model(
        rumbleId,
        userId,
        testDb,
      );
      const asReceiver = await isUserParticipantInRumble_model(
        rumbleId,
        otherUserId,
        testDb,
      );

      expect(asRequester).toBe(true);
      expect(asReceiver).toBe(true);
    });

    test("returns false when user is not in rumble", async () => {
      await seedUser(testDb, { id: userId });
      await seedUser(testDb, { id: otherUserId });
      await seedUser(testDb, { id: outsiderId });
      await seedRumbleRequest();

      await testDb("rumbles").insert({
        id: rumbleId,
        rumble_request_id: requestId,
        requester_id: userId,
        receiver_id: otherUserId,
        status: "active",
      });

      const isParticipant = await isUserParticipantInRumble_model(
        rumbleId,
        outsiderId,
        testDb,
      );

      expect(isParticipant).toBe(false);
    });
  });
  //todo("Add tests for terminateRumble_model.");
});
