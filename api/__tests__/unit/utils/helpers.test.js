import { expect, jest } from "@jest/globals";
import { hashPassword, verifyPassword } from "../../../src/utils/helpers";
import bcrypt from "bcrypt";

describe("helpers utils", () => {
	describe("hashPassword", () => {
		test("returns a bcrypt hash string when given a valid password", async () => {
			const result = await hashPassword("validpassword");
			expect(result).toMatch(/^\$2[ab]\$\d{2}\$.{53}$/);			
		});
		test("produces a hash that does not equal the original password", async () => {
			const result = await hashPassword("validpassword");
			expect(result).not.toBe("validpassword")
		});
		test.todo("uses bcrypt with 10 salt rounds");
		test("throws 'Password must be a string of at least 8 characters' when password is not a string", async () => {
			await expect(hashPassword(["validpassword"])).rejects.toThrow(
				"Password must be a string of at least 8 characters"
			);
		});
		test("throws 'Password must be a string of at least 8 characters' when password is shorter than 8 characters", async () => {
			await expect(hashPassword("passwor")).rejects.toThrow(
				"Password must be a string of at least 8 characters"
			);
		});
	});

	describe("verifyPassword", () => {
		let testHash;
		beforeAll(async () => {
			testHash = await bcrypt.hash("validpassword", 1)
		});

		test("returns true when password matches the provided hash", async () => {
			const result = await verifyPassword("validpassword", testHash);
			expect(result).toBe(true);
		});
		test("returns false when password does not match the provided hash", async () => {
			const result = await verifyPassword("wrongpassword", testHash);
			expect(result).toBe(false);
		});
		test("returns false when password is not a string", async () => {
			const result = await verifyPassword(["validpassword"], testHash);
			expect(result).toBe(false);
		});
		test("returns false when password is shorter than 8 characters", async () => {
			const result = await verifyPassword("pass", testHash);
			expect(result).toBe(false);
		});
	});
});
