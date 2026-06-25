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

  describe("GET /api/user/onboarding", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns onboarding progress for the authenticated user");
  });
});
