describe("auth integration routes", () => {
  describe("POST /api/auth/signup", () => {
    test.todo(
      "returns 201 with accessToken and created user when payload is valid and unique",
    );
    test.todo("returns 409 when email is already in use");
    test.todo("returns 409 when username is already in use");
    test.todo("returns 400 when request body fails signup schema validation");
    test.todo(
      "returns 400 when threat_levels contains unsupported or duplicate values",
    );
    test.todo(
      "returns 500 when ACCESS_TOKEN_SECRET is missing during token creation",
    );
  });

  describe("POST /api/auth/login", () => {
    test.todo(
      "returns 200 with accessToken and public user fields for valid email credentials",
    );
    test.todo(
      "returns 200 with accessToken and public user fields for valid username credentials",
    );
    test.todo("returns 401 for unknown identifier or invalid password");
    test.todo("returns 400 when request body fails login schema validation");
    test.todo("does not include password_hash in the returned user payload");
  });
});
