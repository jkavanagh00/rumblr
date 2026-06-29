import testDb from "../../setup/testDb.js";
import {
  createBlock_model,
  deleteBlock_model,
  getBlockByUsers_model,
  getBlockedUsersByBlockerId_model,
} from "../../../src/models/blocks.js";

describe("blocks model", () => {
  beforeEach(async () => {
    await testDb("blocks").del();
    await testDb("users").del();
  });

  describe("createBlock_model", () => {
    test.todo("creates and returns a block relationship");
    test.todo("uses the provided transaction object when trx is passed");
  });

  describe("getBlockByUsers_model", () => {
    test.todo(
      "returns the block relationship for a blocker and blocked user pair",
    );
    test.todo("returns undefined when the block relationship does not exist");
  });

  describe("deleteBlock_model", () => {
    test.todo("deletes an existing block relationship");
    test.todo("returns 0 when the block relationship does not exist");
  });

  describe("getBlockedUsersByBlockerId_model", () => {
    test.todo("returns public user data for users blocked by the blocker");
    test.todo("returns an empty list when the blocker has not blocked anyone");
  });
});
