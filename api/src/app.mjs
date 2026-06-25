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
app.use(cors());
app.use(bodyParser.json());

const apiRouter = express.Router();

// This is an example of how to set up a route. Replace it with your own.
apiRouter.get("/", async (req, res) => {
  // Here is an example of making a query to the database you set up:
  const query = "SELECT 'Hello, world!' AS message;";
  const result = await db.raw(query);
  res.json(result);
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/rumbles", rumblesRouter);
apiRouter.use("/user", usersRouter);
apiRouter.use("/mismatches", mismatchesRouter);
apiRouter.use("/statements", statementsRouter);

app.use("/api", apiRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register error handler middleware (must be last)
app.use(errorHandler);

export default app;
