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
      {
    url: "https://rumblr-backend-api.onrender.com/api",
    description: "Render production server",
  },
],

    tags: [
      { name: "Auth", description: "Signup and login" },
      { name: "Users", description: "User profile and blocking" },
      { name: "Statements", description: "Statements and user responses" },
      {
        name: "Mismatches",
        description: "Mismatch discovery and rumble requests",
      },
      { name: "Rumbles", description: "Active rumbles and messages" },
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
          description:
            "User object as returned by the API — email and password_hash are never included",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            bio: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["active", "inactive", "suspended"],
            },
            role: { type: "string", enum: ["user", "admin"] },
            threat_levels: {
              type: "array",
              items: { type: "string", enum: ["green", "orange", "red"] },
            },
            created_at: { type: "string", format: "date-time" },
          },
        },
        PublicUser: {
          type: "object",
          description:
            "User object returned by auth endpoints — email and password_hash are stripped",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            bio: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["active", "inactive", "suspended"],
            },
            role: { type: "string", enum: ["user", "admin"] },
            threat_levels: {
              type: "array",
              items: { type: "string", enum: ["green", "orange", "red"] },
            },
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
            shared_responses: { type: "integer", minimum: 10 },
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
            threat_level: { type: "string", enum: ["green", "orange", "red"] },
            status: {
              type: "string",
              enum: ["pending", "accepted", "declined"],
            },
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
            status: {
              type: "string",
              enum: ["active", "inactive", "terminated"],
            },
            threat_level: { type: "string", enum: ["green", "orange", "red"] },
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
        UserReport: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            reporter_id: { type: "string", format: "uuid" },
            reported_user_id: { type: "string", format: "uuid" },
            rumble_id: { type: "string", format: "uuid", nullable: true },
            reason: { type: "string" },
            message_log: {
              type: "array",
              nullable: true,
              description:
                "Snapshot of the rumble's messages at report time; null when there was no active rumble",
              items: { $ref: "#/components/schemas/Message" },
            },
            status: { type: "string", enum: ["open", "closed"] },
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
                total: { type: "integer" },
                totalPages: { type: "integer" },
                hasNext: { type: "boolean" },
                hasPrev: { type: "boolean" },
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
            threat_levels: {
              type: "array",
              items: { type: "string", enum: ["green", "orange", "red"] },
              default: ["green"],
            },
          },
        },
        LoginBody: {
          type: "object",
          required: ["identifier", "password"],
          properties: {
            identifier: {
              type: "string",
              description: "Email or username",
              example: "alice_agrees",
            },
            password: { type: "string", example: "password123" },
          },
          example: { identifier: "alice_agrees", password: "password123" },
        },
        UpdateUserBody: {
          type: "object",
          properties: {
            username: { type: "string", minLength: 3 },
            email: { type: "string", format: "email" },
            bio: { type: "string", maxLength: 280 },
            status: {
              type: "string",
              enum: ["active", "inactive", "suspended"],
            },
            threat_levels: {
              type: "array",
              items: { type: "string", enum: ["green", "orange", "red"] },
            },
          },
        },
        CreateRumbleRequestBody: {
          type: "object",
          required: ["threat_level"],
          properties: {
            threat_level: { type: "string", enum: ["green", "orange", "red"] },
          },
        },
        CreateMessageBody: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              minLength: 1,
              example:
                "Climate science has been wrong before. We should be more skeptical of these predictions.",
            },
          },
          example: {
            content:
              "Climate science has been wrong before. We should be more skeptical of these predictions.",
          },
        },
        CreateStatementBody: {
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string" },
          },
        },
        UpdateStatementBody: {
          type: "object",
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
        CreateUserReportBody: {
          type: "object",
          required: ["reason"],
          properties: {
            reason: {
              type: "string",
              minLength: 1,
              maxLength: 500,
              example: "Harassment and repeated abusive language in rumble chat",
            },
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
          description:
            "No bearer token provided. Note: an invalid or expired token returns 403 with `Invalid or expired token.`",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { error: "Access denied. No token provided." },
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
        ContentFlagged: {
          description:
            "Submitted content was flagged by the moderation service and rejected",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: {
                error: "This content violates our community guidelines",
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

export default swaggerJsdoc(options);
