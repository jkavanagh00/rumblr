describe("requests integration routes", () => {
	describe("POST /api/mismatches/:id", () => {
		test.todo("returns 401 when no bearer token is provided");
		test.todo("returns 403 when bearer token is invalid or expired");
		test.todo("returns 400 when another pending rumble request already exists");
		test.todo("returns 201 with created rumble request when no pending request exists");
	});

	describe("POST /api/mismatches/:id/accept", () => {
		test.todo("returns 401 when no bearer token is provided");
		test.todo("returns 403 when bearer token is invalid or expired");
		test.todo("returns 404 when the rumble request does not exist");
		test.todo("returns 401 when authenticated user is not the request receiver");
		test.todo("returns 201 with rumble payload when receiver accepts a valid request");
	});

	describe("POST /api/mismatches/:id/decline", () => {
		test.todo("returns 401 when no bearer token is provided");
		test.todo("returns 403 when bearer token is invalid or expired");
		test.todo("returns 404 when the rumble request does not exist");
		test.todo("returns 401 when authenticated user is not the request receiver");
		test.todo("returns 201 with confirmation message when receiver declines a valid request");
	});
});
