process.env.ACCESS_TOKEN_SECRET = "test-secret";
process.env.MODERATION_ENABLED = "false";   // default off; suites testing 422 mock the service instead
process.env.CLIENT_ORIGIN = "";            // avoid CORS middleware variance