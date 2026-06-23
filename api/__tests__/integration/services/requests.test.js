describe("requests integration services", () => {
	describe("acceptRumbleRequest_service", () => {
		test.todo(
			"starts a db transaction and passes trx to acceptRumbleRequest_model, addRumble_model, and getRumbleRequestById_model",
		);
		test.todo(
			"calls acceptRumbleRequest_model first with data.rumble_request_id before attempting rumble creation",
		);
		test.todo(
			"throws 'No pending rumble request found' when acceptRumbleRequest_model updates fewer than 1 row",
		);
		test.todo(
			"creates a rumble by calling addRumble_model with the full input data object and current trx",
		);
		test.todo(
			"loads the updated request by id after rumble creation and returns { rumbleRequest, rumble }",
		);
		test.todo(
			"propagates model errors and lets the transaction reject without swallowing the original error",
		);
	});
});
