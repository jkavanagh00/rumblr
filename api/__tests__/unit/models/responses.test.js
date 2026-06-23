import testDb from "../../setup/testDb";
import {
  fetchSharedResponses_model,
  upsertResponse_model,
  deleteResponse_model,
  listResponses_model,
  listUsersWhoResponded_model,
} from "../../../src/models/responses.js";

describe("fetchSharedResponses_model", () => {
  test.todo("returns an array of responses that two users have in common");
  test.todo("returns an empty array when no responses are shared");
});

describe("upsertResponse_model", () => {
  test.todo("returns the upserted response object in the correct shape");
  test.todo("creates a new response when none already exist");
  test.todo("updates an existing response when one already exists");
});

describe("deleteResponse_model", () => {
  test.todo("returns the deleted response data");
  test.todo("successfully deletes the response from the database");
});

describe("listResponses_model", () => {
  test.todo("returns all responses associated with the passed user id");
  test.to("returns an empty array when no responses exist");
});

describe("listUsersWhoResponded_model", () => {
  test.todo("returns an array of user ids");
  test.todo(
    "returns only the ids of users who have responses to the statement",
  );
  test.todo("returns an empty array when no users with responses exist");
});
