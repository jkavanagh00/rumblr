describe("users integration routes", () => {
  describe("GET /api/user", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns 404 when authenticated user does not exist");
    test.todo(
      "returns 200 with current user profile for a valid authenticated request",
    );
  });

  describe("PUT /api/user", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns 400 when update payload fails schema validation");
    test.todo("returns 404 when authenticated user does not exist for update");
    test.todo(
      "returns 200 with updated user when valid authenticated payload is submitted",
    );
  });

  describe("DELETE /api/user", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo(
      "returns 404 when authenticated user does not exist for deletion",
    );
    test.todo("returns 204 with empty response body when deletion succeeds");
  });

  describe("GET /api/user/blocks", () => {
    test.todo("returns blocked users for the authenticated user");
    test.todo("returns 401 when the user is not authenticated");
  });

  describe("POST /api/user/blocks/:id", () => {
    test.todo("validates the blocked user id route parameter");
    test.todo("creates a block relationship for the authenticated user");
    test.todo("returns controller errors through the error handler");
  });

  describe("DELETE /api/user/blocks/:id", () => {
    test.todo("validates the blocked user id route parameter");
    test.todo("removes a block relationship for the authenticated user");
    test.todo("returns controller errors through the error handler");
  });
});
