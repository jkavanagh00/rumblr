import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RUMBLR API",
      version: "1.0.0",
      description:
        "REST API for RUMBLR — the world's first and only online hating site.",
    },
    servers: [
      {
        url: "http://localhost:3001/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // ── Domain models ──────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            bio: { type: "string", nullable: true },
            status: { type: "string", enum: ["active", "inactive", "suspended"] },
            role: { type: "string", enum: ["user", "admin"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        PublicUser: {
          type: "object",
          description: "User object returned by auth endpoints — email and password_hash are stripped",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            bio: { type: "string", nullable: true },
            status: { type: "string", enum: ["active", "inactive", "suspended"] },
            role: { type: "string", enum: ["user", "admin"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Statement: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            content: { type: "string" },
          },
        },
        Response: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            statement_id: { type: "string", format: "uuid" },
            agreement_score: { type: "integer", minimum: 1, maximum: 5 },
            importance_score: { type: "integer", minimum: 1, maximum: 5 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Mismatch: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user1_id: { type: "string", format: "uuid" },
            user2_id: { type: "string", format: "uuid" },
            mismatch_score: { type: "integer", minimum: 0, maximum: 100 },
            shared_responses: { type: "integer", minimum: 20 },
            confidence: { type: "string", enum: ["low", "medium", "high"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        RumbleRequest: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            requester_id: { type: "string", format: "uuid" },
            receiver_id: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["pending", "accepted", "declined"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Rumble: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            rumble_request_id: { type: "string", format: "uuid" },
            requester_id: { type: "string", format: "uuid" },
            receiver_id: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["active", "inactive", "terminated"] },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            rumble_id: { type: "string", format: "uuid" },
            sender_id: { type: "string", format: "uuid" },
            content: { type: "string" },
            sent_at: { type: "string", format: "date-time" },
          },
        },
        Block: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            blocker_id: { type: "string", format: "uuid" },
            blocked_id: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        // ── Composite response shapes ──────────────────────────────────
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            user: { $ref: "#/components/schemas/PublicUser" },
          },
        },
        PaginatedMessages: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Message" },
            },
            pagination: {
              type: "object",
              properties: {
                page: { type: "integer" },
                limit: { type: "integer" },
              },
            },
          },
        },
        OnboardingProgress: {
          type: "object",
          properties: {
            completed: { type: "boolean" },
            answeredCount: { type: "integer" },
            requiredCount: { type: "integer" },
            remainingCount: { type: "integer" },
          },
        },
        // ── Request bodies ─────────────────────────────────────────────
        SignupBody: {
          type: "object",
          required: ["username", "email", "password"],
          properties: {
            username: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            bio: { type: "string", maxLength: 280 },
          },
        },
        LoginBody: {
          type: "object",
          required: ["identifier", "password"],
          properties: {
            identifier: { type: "string", description: "Email or username" },
            password: { type: "string" },
          },
        },
        UpdateUserBody: {
          type: "object",
          properties: {
            username: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            bio: { type: "string", maxLength: 280 },
            status: { type: "string", enum: ["active", "inactive", "suspended"] },
          },
        },
        CreateRumbleBody: {
          type: "object",
          required: ["rumble_request_id", "requester_id", "receiver_id"],
          properties: {
            rumble_request_id: { type: "string", format: "uuid" },
            requester_id: { type: "string", format: "uuid" },
            receiver_id: { type: "string", format: "uuid" },
            status: { type: "string", enum: ["active", "inactive", "terminated"] },
          },
        },
        CreateMessageBody: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", minLength: 1 },
          },
        },
        CreateStatementBody: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string" },
          },
        },
        CreateResponseBody: {
          type: "object",
          required: ["agreement_score", "importance_score"],
          properties: {
            agreement_score: { type: "integer", minimum: 1, maximum: 5 },
            importance_score: { type: "integer", minimum: 1, maximum: 5 },
          },
        },
        // ── Common error ───────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid authentication token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { error: "Unauthorized" },
            },
          },
        },
        Forbidden: {
          description: "Authenticated but not permitted (admin only)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { error: "Forbidden" },
            },
          },
        },
        NotFound: {
          description: "The requested resource was not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { error: "Not found" },
            },
          },
        },
        BadRequest: {
          description: "Invalid request body or parameters",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { error: "Bad request" },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export default swaggerJsdoc(options);
