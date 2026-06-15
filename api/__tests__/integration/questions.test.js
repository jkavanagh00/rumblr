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

const { listQuestions_Controller, getQuestionById_Controller, addQuestion_Controller, updateQuestion_Controller, deleteQuestion_Controller } = await import(
	"../../src/controllers/questions.js"
);
const { default: questionsRouter } = await import("../../src/routes/questions.js");

const app = express();
app.use(express.json());
app.use("/questions", questionsRouter);

beforeEach(() => {
	jest.clearAllMocks();
});

const testId = "11111111-1111-4111-8111-111111111111";

describe("questions integration routes", () => {
    describe("GET /questions/:id", () => {
        test("returns a question by ID", async () => {
            const mockQuestion = { id: testId, content: "Question 1" };
            getQuestionById_Controller.mockResolvedValue(mockQuestion);

            const response = await request(app).get(`/questions/${testId}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockQuestion);
            expect(getQuestionById_Controller).toHaveBeenCalledTimes(1);
        });
        test("returns 500 when the controller throws", async () => {
            getQuestionById_Controller.mockRejectedValue(new Error("Database error"));

            const response = await request(app).get(`/questions/${testId}`);

            expect(response.status).toBe(500);
            expect(getQuestionById_Controller).toHaveBeenCalledTimes(1);
        });
    });

	describe("GET /questions/list", () => {
		test("returns a list of questions", async () => {
			// Stub the controller so this test isolates router behavior: status code, JSON body, and route wiring.
			const mockQuestions = [
				{ id: testId, content: "Question 1" },
				{ id: "22222222-2222-4222-8222-222222222222", content: "Question 2" },
			];

			listQuestions_Controller.mockResolvedValue(mockQuestions);

			// Send a real HTTP request through Express to verify GET /questions/list reaches the correct handler.
			const response = await request(app).get("/questions/list");

			// A successful controller response should be returned as a 200 with the same JSON payload.
			expect(response.status).toBe(200);
			expect(response.body).toEqual(mockQuestions);
			// This confirms the route actually called the controller rather than bypassing that layer.
			expect(listQuestions_Controller).toHaveBeenCalledTimes(1);
		});

		test("returns 500 when the controller throws", async () => {
			// Simulate an unexpected controller failure to verify the route's catch block behavior.
			listQuestions_Controller.mockRejectedValue(new Error("Database error"));

			// The request should still complete cleanly even though the controller rejected.
			const response = await request(app).get("/questions/list");

			// The route is expected to translate thrown errors into a 500 response with an error message body.
			expect(response.status).toBe(500);
			expect(response.body).toEqual({ error: "Database error" });
			// This guards against false positives where the test passes without the controller being invoked.
			expect(listQuestions_Controller).toHaveBeenCalledTimes(1);
		});
	});
});
