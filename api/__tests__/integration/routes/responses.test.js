describe("responses integration routes", () => {
  describe("POST /api/statements/:id/respond", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo(
      "returns 400 when response payload fails schema validation (scores missing, non-integer, or out of range)",
    );
    test.todo(
      "returns 201 with created response payload when authenticated user submits valid scores for a statement",
    );
    test.todo(
      "returns an error status when business rules reject duplicate responses or unknown statement ids",
    );
  });

  describe("GET /api/statements/responses", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo(
      "returns 404 when no responses are found for the authenticated user",
    );
    test.todo("returns 200 with current user responses when data exists");
  });
});
