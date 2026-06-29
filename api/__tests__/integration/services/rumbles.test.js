import { seedRumble } from "../../setup/factories.js";
import testDb from "../../setup/testDb.js";
import { jest } from "@jest/globals";
import { randomUUID } from "node:crypto";

jest.unstable_mockModule("../../../src/database/db.js", () => ({
  default: testDb,
}));

const { terminateRumble_service } = await import(
  "../../../src/services/rumbles.js"
);

const rumbleId = randomUUID();
const requesterId = randomUUID();
const receiverId = randomUUID();
const outsiderId = randomUUID();

beforeAll(async () => {
  await testDb.migrate.latest({ directory: "./src/database/migrations" });
});

beforeEach(async () => {
  await testDb("rumbles").del();
  await testDb("rumble_requests").del();
  await testDb("users").del();
});

describe("rumble termination service", () => {
  test("returns the rumble with status set to terminated", async () => {
    await seedRumble(testDb, {
      id: rumbleId,
      requester_id: requesterId,
    });
    const result = await terminateRumble_service(rumbleId, requesterId);
    expect(result).toMatchObject({
      id: rumbleId,
      status: "terminated",
      requester_id: requesterId,
    });
  });
  test("throws when the rumble does not exist", async () => {
    await expect(
      terminateRumble_service(rumbleId, requesterId),
    ).rejects.toThrow("Rumble not found");
  });
  test("throws when the user is not a participant in the rumble", async () => {
    await seedRumble(testDb, {
      id: rumbleId,
      requester_id: requesterId,
      receiver_id: receiverId,
    });
    await expect(
      terminateRumble_service(rumbleId, outsiderId),
    ).rejects.toThrow("You are not a participant in this rumble");
  });
  test("returns the rumble unchanged when it is already terminated", async () => {
    await seedRumble(testDb, {
      id: rumbleId,
      status: "terminated",
      requester_id: requesterId,
    });
    const result = await terminateRumble_service(rumbleId, requesterId);
    expect(result).toMatchObject({
      id: rumbleId,
      status: "terminated",
      requester_id: requesterId,
    });
  });
});
