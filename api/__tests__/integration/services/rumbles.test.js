import { seedRumble } from "../../setup/factories.js";
import testDb from "../../setup/testDb.js";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/database/db.js", () => ({
  default: testDb,
}));

const { terminateRumble_service } = await import(
  "../../../src/services/rumbles.js"
);

const rumbleId = "11111111-1111-4111-8111-333333333333";
const requesterId = "11111111-1111-4111-8111-111111111111";
const receiverId = "22222222-2222-4222-8222-222222222222";

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
    await seedRumble(testDb, { id: rumbleId, status: "active", requester_id: requesterId });
    const result = await terminateRumble_service(rumbleId, requesterId);
    expect(result).toMatchObject({
      id: rumbleId,
      status: "terminated",
      requester_id: requesterId,
    });
  });
  test.todo("throws when the rumble does not exist");
  test.todo("throws when the user is not a participant in the rumble");
  test.todo("returns the rumble unchanged when it is already terminated");
});
