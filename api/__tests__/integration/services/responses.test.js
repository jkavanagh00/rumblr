describe("responses integration services", () => {
	describe("addResponse_service", () => {
		test.todo("starts a db transaction and runs all write operations inside trx");
		test.todo(
			"checks statement existence with getStatementById_model(statementId) before inserting a response",
		);
		test.todo(
			"throws 'No statement with provided id found' when getStatementById_model returns falsy",
		);
		test.todo(
			"calls upsertResponse_model with statementId, userId, responseData, and trx when statement exists",
		);
		test.todo(
			"calls listUsersWhoResponded_model with statementId, userId, and trx to find other responders",
		);
		test.todo(
			"calls upsertMismatch_model once per returned other user id using current userId and trx",
		);
		test.todo(
			"returns totalUpsertedMismatches as 0 when no other users have responded",
		);
		test.todo(
			"returns { upsertedResponse, totalUpsertedMismatches } after all mismatch upserts complete",
		);
		test.todo(
			"propagates errors from upsertResponse_model, listUsersWhoResponded_model, or upsertMismatch_model",
		);
	});
});
