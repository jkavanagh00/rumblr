import {
  upsertMismatch_model,
  listMismatchesForUser_model,
} from "../../../src/models/mismatches.js";
import testDb from "../../setup/testDb.js";
import {
  seedUser,
  seedResponse,
  seedMismatch,
} from "./../../setup/factories.js";

describe("mismatches model", () => {
  beforeEach(async () => {
    await testDb("mismatches").del();
    await testDb("responses").del();
    await testDb("statements").del();
    await testDb("users").del();
  });

  describe("upsertMismatch", () => {
    test.todo(
      "inserts a new mismatch row when no existing row is found and shared responses are at least 20",
    );
    test.todo(
      "updates an existing mismatch row when the pair already exists and shared responses are at least 20",
    );
    test.todo(
      "deletes an existing mismatch row when shared responses fall below 20",
    );
    test.todo(
      "does not insert a mismatch row when no existing row is found and shared responses are below 20",
    );
    test.todo(
      "canonicalizes user pair order so reversed input user IDs map to the same mismatch row",
    );
    test.todo(
      "writes mismatch_score, confidence, shared_responses, and updated_at with expected values",
    );
  });

  describe("listMismatchesForUser", () => {
    test.todo("returns mismatch rows where the user appears as user1_id");
    test.todo("returns mismatch rows where the user appears as user2_id");
    test.todo("returns rows ordered by mismatch_score descending");
    test.todo(
      "uses shared_responses descending as the tie-breaker for equal mismatch scores",
    );
    test.todo("returns an empty array when the user has no mismatches");
  });
});
