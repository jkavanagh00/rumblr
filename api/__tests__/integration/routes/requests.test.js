describe("requests integration routes", () => {
  describe("GET /api/mismatches/requests", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo(
      "returns 200 with incoming and outgoing rumble requests for the authenticated user",
    );
    test.todo(
      "returns 200 with an empty data array when the authenticated user has no rumble requests",
    );
  });

  describe("POST /api/mismatches/:id", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo(
      "returns 400 when threat_level is missing, invalid, or not shared by both users",
    );
    test.todo(
      "returns 400 with the remaining cooldown time when the same requester sends a new request to the same receiver within 7 days of rejection",
    );
    test.todo(
      "returns 201 when the rejection cooldown has expired for the same requester/receiver pair",
    );
    test.todo(
      "does not apply the rejection cooldown to requests sent to a different receiver",
    );
    test.todo("returns 400 when another pending rumble request already exists");
    test.todo(
      "returns 201 with created rumble request when no pending request exists",
    );
  });

  describe("POST /api/mismatches/:id/accept", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns 404 when the rumble request does not exist");
    test.todo(
      "returns 401 when authenticated user is not the request receiver",
    );
    test.todo(
      "returns 201 with rumble payload when receiver accepts a valid request",
    );
  });

  describe("POST /api/mismatches/:id/decline", () => {
    test.todo("returns 401 when no bearer token is provided");
    test.todo("returns 403 when bearer token is invalid or expired");
    test.todo("returns 404 when the rumble request does not exist");
    test.todo(
      "returns 401 when authenticated user is not the request receiver",
    );
    test.todo(
      "returns 201 with confirmation message when receiver declines a valid request",
    );
  });
});
