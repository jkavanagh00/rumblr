import testDb from "../../setup/testDb.js";
import { seedUser } from "../../setup/factories.js";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/database/db.js", () => ({
  default: testDb,
}));

const { acceptRumbleRequest_service } = await import("../../../src/services/requests.js");

const requesterId = "11111111-1111-4111-8111-111111111111";
const receiverId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";

async function seedRumbleRequest(overrides = {}) {
  const data = {
    id: requestId,
    requester_id: requesterId,
    receiver_id: receiverId,
    threat_level: "orange",
    status: "pending",
    ...overrides,
  };
  await testDb("rumble_requests").insert(data);
  return data;
}

beforeEach(async () => {
  await testDb("rumbles").del();
  await testDb("rumble_requests").del();
  await testDb("users").del();
});

describe("requests integration services", () => {
  describe("acceptRumbleRequest_service", () => {
    test("starts a db transaction and passes trx to acceptRumbleRequest_model, addRumble_model, and getRumbleRequestById_model", async () => {
      await seedUser(testDb, { id: requesterId });
      await seedUser(testDb, { id: receiverId });
      await seedRumbleRequest();

      const result = await acceptRumbleRequest_service({
        rumble_request_id: requestId,
        requester_id: requesterId,
        receiver_id: receiverId,
        threat_level: "orange",
      });

      // all three models ran within the same committed transaction
      const request = await testDb("rumble_requests").where({ id: requestId }).first();
      const rumble = await testDb("rumbles").where({ rumble_request_id: requestId }).first();
      expect(request.status).toBe("accepted");
      expect(rumble).toBeDefined();
      expect(result.rumbleRequest).toBeDefined();
      expect(result.rumble).toBeDefined();
    });

    test("calls acceptRumbleRequest_model first with data.rumble_request_id before attempting rumble creation", async () => {
      await seedUser(testDb, { id: requesterId });
      await seedUser(testDb, { id: receiverId });
      await seedRumbleRequest({ status: "accepted" }); // not pending → 0 rows updated

      await expect(
        acceptRumbleRequest_service({
          rumble_request_id: requestId,
          requester_id: requesterId,
          receiver_id: receiverId,
          threat_level: "orange",
        }),
      ).rejects.toThrow();

      const rumble = await testDb("rumbles").where({ rumble_request_id: requestId }).first();
      expect(rumble).toBeUndefined(); // addRumble_model was never called
    });

    test("throws 'No pending rumble request found' when acceptRumbleRequest_model updates fewer than 1 row", async () => {
      await seedUser(testDb, { id: requesterId });
      await seedUser(testDb, { id: receiverId });
      await seedRumbleRequest({ status: "accepted" }); // not pending → 0 rows updated

      await expect(
        acceptRumbleRequest_service({
          rumble_request_id: requestId,
          requester_id: requesterId,
          receiver_id: receiverId,
          threat_level: "orange",
        }),
      ).rejects.toThrow("No pending rumble request found");
    });

    test("creates a rumble by calling addRumble_model with the full input data object and current trx", async () => {
      await seedUser(testDb, { id: requesterId });
      await seedUser(testDb, { id: receiverId });
      await seedRumbleRequest();

      const data = {
        rumble_request_id: requestId,
        requester_id: requesterId,
        receiver_id: receiverId,
        threat_level: "orange",
      };

      await acceptRumbleRequest_service(data);

      const rumble = await testDb("rumbles").where({ rumble_request_id: requestId }).first();
      expect(rumble.requester_id).toBe(data.requester_id);
      expect(rumble.receiver_id).toBe(data.receiver_id);
      expect(rumble.threat_level).toBe(data.threat_level);
    });

    test("loads the updated request by id after rumble creation and returns { rumbleRequest, rumble }", async () => {
      await seedUser(testDb, { id: requesterId });
      await seedUser(testDb, { id: receiverId });
      await seedRumbleRequest();

      const result = await acceptRumbleRequest_service({
        rumble_request_id: requestId,
        requester_id: requesterId,
        receiver_id: receiverId,
        threat_level: "orange",
      });

      expect(result).toHaveProperty("rumbleRequest");
      expect(result).toHaveProperty("rumble");
      expect(result.rumbleRequest.id).toBe(requestId);
      expect(result.rumbleRequest.status).toBe("accepted");
      expect(result.rumble.rumble_request_id).toBe(requestId);
    });

    test("propagates model errors and lets the transaction reject without swallowing the original error", async () => {
      await seedUser(testDb, { id: requesterId });
      await seedUser(testDb, { id: receiverId });
      await seedRumbleRequest();

      // requester_id: null triggers a NOT NULL violation inside addRumble_model,
      // after acceptRumbleRequest_model has already updated the status to "accepted"
      await expect(
        acceptRumbleRequest_service({
          rumble_request_id: requestId,
          requester_id: null,
          receiver_id: receiverId,
          threat_level: "orange",
        }),
      ).rejects.toThrow();

      const request = await testDb("rumble_requests").where({ id: requestId }).first();
      expect(request.status).toBe("pending"); // transaction was rolled back
    });
  });
});
