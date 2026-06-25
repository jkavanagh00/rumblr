describe("requests controller", () => {
	describe("sendRumbleRequest_controller", () => {
		test.todo("returns 400 when threat_level is missing, invalid, or not allowed for requester/receiver");
		test.todo("returns 400 when another pending rumble request already exists between the users");
		test.todo("creates a new rumble request with req.user.id and req.params.id, then returns 201");
		test.todo("forwards model errors to next");
	});

	describe("acceptRumbleRequest_controller", () => {
		test.todo("returns 404 when the rumble request id does not exist");
		test.todo("returns 401 when the authenticated user is not the request receiver");
		test.todo("builds the service payload from request fields and authenticated receiver id");
		test.todo("calls acceptRumbleRequest_service and returns 201 with the created rumble");
		test.todo("forwards model or service errors to next");
	});

	describe("declineRumbleRequest_controller", () => {
		test.todo("returns 404 when the rumble request id does not exist");
		test.todo("returns 401 when the authenticated user is not the request receiver");
		test.todo("declines the request and returns 201 with the confirmation message");
		test.todo("forwards model errors to next");
	});
});
