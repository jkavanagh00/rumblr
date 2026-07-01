import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import db from "./database/db.js";
import authRouter from "./routes/auth.js";
import rumblesRouter from "./routes/rumbles.js";
import usersRouter from "./routes/users.js";
import mismatchesRouter from "./routes/mismatches.js";
import statementsRouter from "./routes/statements.js";
// Import global error handler
import { errorHandler } from "./middlewares/errors.js";

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN;

// If CLIENT_ORIGIN is set, restrict CORS to that origin only.
// Without a frontend this can be left unset.
if (allowedOrigin) {
  app.use(cors({ origin: allowedOrigin, credentials: true }));
}
app.use(bodyParser.json());

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/rumbles", rumblesRouter);
apiRouter.use("/user", usersRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/mismatches", mismatchesRouter);
apiRouter.use("/statements", statementsRouter);

app.use("/api", apiRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register error handler middleware (must be last)
app.use(errorHandler);

export default app;
