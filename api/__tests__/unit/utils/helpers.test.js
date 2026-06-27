describe("helpers utils", () => {
	describe("hashPassword", () => {
		test.todo("returns a bcrypt hash string when given a valid password");
		test.todo("produces a hash that does not equal the original password");
		test.todo("uses bcrypt with 10 salt rounds");
		test.todo(
			"throws 'Password must be a string of at least 8 characters' when password is not a string",
		);
		test.todo(
			"throws 'Password must be a string of at least 8 characters' when password is shorter than 8 characters",
		);
		test.todo("accepts a password of exactly 8 characters");
	});

	describe("verifyPassword", () => {
		test.todo("returns true when password matches the provided hash");
		test.todo("returns false when password does not match the provided hash");
		test("returns false when password is not a string", async () => {
			const result = await verifyPassword(["password"]);
			expect(result).toBe(false);
		});
		test("returns false when password is shorter than 8 characters", async () => {
			const result = await verifyPassword("pass");
			expect(result).toBe(false);
		});
		test.todo(
			"uses bcrypt.compareSync for valid password inputs and the provided hash",
		);
	});
});
