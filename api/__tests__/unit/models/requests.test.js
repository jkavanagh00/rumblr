import testDb from "../../setup/testDb";
import {
  upsertMismatch_model,
  listMismatchesForUser_model,
} from "../../../src/models/mismatches";

describe("upsertMismatch_model", () => {
  test.todo("creates a new mismatch if no mismatch already exists");
  test.todo("updates the existing mismatch if one already exists");
  test.todo("deletes an existing mismatch if shared responses falls below 10");
  test.todo(
    "targets the correct mismatch without regard to the order of user ids passed",
  );
});

describe("list mismatches for user", () => {
  test.todo("returns an array containing the user's mismatches");
  test.todo("returns an empty array when no mismatches exist");
  test.todo(
    "returns an array of objects ordered first by mismatch score and then by total shared answers",
  );
});
