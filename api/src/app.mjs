import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./database/db.js";
import authRouter from "./routes/auth.js";
import chatsRouter from "./routes/chats.js";
import nestedRouter from "./routes/nested.js";
import usersRouter from "./routes/users.js";
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

// Here is an example of optionally setting up nested routes. Replace it or delete as needed.
apiRouter.use("/auth", authRouter);
apiRouter.use("/nested", nestedRouter);
apiRouter.use("/chats", chatsRouter);
apiRouter.use("/user", usersRouter);

app.use("/api", apiRouter);

// Register error handler middleware (must be last)
app.use(errorHandler);

export default app;
