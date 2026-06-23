describe("helpers utils", () => {
	describe("hashPassword", () => {
		test.todo("returns a bcrypt hash string when given a valid password");
		test.todo("produces a hash that does not equal the original password");
		test.todo("throws when password is not a string");
		test.todo("throws when password is shorter than 8 characters");
	});

	describe("verifyPassword", () => {
		test.todo("returns true when password matches the provided hash");
		test.todo("returns false when password does not match the provided hash");
		test.todo("returns false when password is not a string");
		test.todo("returns false when password is shorter than 8 characters");
	});
});
