import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/controllers/questions.js", () => ({
	addQuestion_Controller: jest.fn(),
	getQuestionById_Controller: jest.fn(),
	listQuestions_Controller: jest.fn(),
	updateQuestion_Controller: jest.fn(),
	deleteQuestion_Controller: jest.fn(),
}));

const { listQuestions_Controller } = await import(
	"../../src/controllers/questions.js"
);
const { default: questionsRouter } = await import("../../src/routes/questions.js");

const app = express();
app.use(express.json());
app.use("/questions", questionsRouter);

beforeEach(() => {
	jest.clearAllMocks();
});

describe("questions integration routes", () => {
	describe("GET /questions/list", () => {
		test("returns a list of questions", async () => {
			const mockQuestions = [
				{ id: "q1", content: "Question 1" },
				{ id: "q2", content: "Question 2" },
			];

			listQuestions_Controller.mockResolvedValue(mockQuestions);

			const response = await request(app).get("/questions/list");

			expect(response.status).toBe(200);
			expect(response.body).toEqual(mockQuestions);
			expect(listQuestions_Controller).toHaveBeenCalledTimes(1);
		});

		test("returns 500 when the controller throws", async () => {
			listQuestions_Controller.mockRejectedValue(new Error("Database error"));

			const response = await request(app).get("/questions/list");

			expect(response.status).toBe(500);
			expect(response.body).toEqual({ error: "Database error" });
			expect(listQuestions_Controller).toHaveBeenCalledTimes(1);
		});
	});
});
