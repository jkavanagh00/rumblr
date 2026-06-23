import testDb from "../../setup/testDb.js";
import { seedUser } from "../../setup/factories.js";
import {
  getUserById_model,
  findUserByEmail_model,
  findUserByUsername_model,
  deleteUserById_model,
} from "../../../src/models/users.js";

describe("users model", () => {
  beforeEach(async () => {
    await testDb("responses").del();
    await testDb("rumbles").del();
    await testDb("users").del();
  });

  describe("getUserById_model", () => {
    test.todo("returns the requested user");
    test.todo("returns undefined when user is missing");
  });

  describe("find user model helpers", () => {
    test.todo("finds a user by email and username");
  });

  describe("deleteUserById_model", () => {
    test.todo("deletes and returns the deleted user");
  });
});
