describe("errors middleware", () => {
	describe("validateBody", () => {
		test.todo("calls schema.safeParse with req.body");
		test.todo("attaches parsed data to req.validatedBody when schema validation succeeds");
		test.todo("calls next with no arguments when schema validation succeeds");
		test.todo("calls next with Zod error when schema validation fails");
		test.todo("does not set req.validatedBody when schema validation fails");
	});

	describe("errorHandler", () => {
		test.todo("returns 400 validation response for ZodError instances");
		test.todo("returns 400 validation response when err.name is ZodError");
		test.todo("returns 400 validation response when err.issues is an array");
		test.todo("maps each validation issue to field and message in response errors array");
		test.todo("uses empty errors array when validation error has no issues");
		test.todo("returns err.status for non-validation errors when provided");
		test.todo("defaults to 500 for non-validation errors without status");
		test.todo("returns err.message for non-validation errors when provided");
		test.todo("defaults message to Internal Server Error when non-validation error has no message");
	});
});
