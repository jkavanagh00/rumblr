describe("users controller", () => {
	describe("getUser_controller", () => {
		test.todo("calls getUserById_model with req.user.id");
		test.todo("returns 404 when the user cannot be found");
		test.todo("returns 200 with the user when found");
		test.todo("forwards model errors to next");
	});

	describe("updateUser_controller", () => {
		test.todo("calls updateUserById_model with req.user.id and req.validatedBody");
		test.todo("returns 404 when the user cannot be found for update");
		test.todo("returns 200 with the updated user when update succeeds");
		test.todo("forwards model errors to next");
	});

	describe("deleteUser_controller", () => {
		test.todo("calls deleteUserById_model with req.user.id");
		test.todo("returns 404 when the user cannot be found for deletion");
		test.todo("returns 204 and sends no body when deletion succeeds");
		test.todo("forwards model errors to next");
	});
});
