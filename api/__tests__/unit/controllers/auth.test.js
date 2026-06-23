describe("auth controller", () => {
	describe("signup_controller", () => {
		test.todo("returns 409 when an account already exists for the provided email");
		test.todo("returns 409 when the username is already taken after email uniqueness passes");
		test.todo("creates a user with hashed password and nullable bio, then returns 201 with accessToken and user payload");
		test.todo("forwards an error to next when ACCESS_TOKEN_SECRET is missing during token generation");
		test.todo("forwards model or helper errors to next");
	});

	describe("login_controller", () => {
		test.todo("uses email lookup when identifier contains @ and returns 401 for unknown account");
		test.todo("uses username lookup when identifier does not contain @ and returns 401 for unknown account");
		test.todo("returns 401 when password verification fails for an existing account");
		test.todo("returns 200 with accessToken and public user fields when credentials are valid");
		test.todo("removes password_hash from the returned user object");
		test.todo("forwards an error to next when ACCESS_TOKEN_SECRET is missing during token generation");
		test.todo("forwards model or helper errors to next");
	});

	describe("me_controller", () => {
		test.todo("uses req.user.id when available to load the current user");
		test.todo("falls back to req.userId when req.user.id is undefined");
		test.todo("returns 404 when no public user exists for the resolved user id");
		test.todo("returns 200 with the public user profile when found");
		test.todo("forwards model errors to next");
	});
});
