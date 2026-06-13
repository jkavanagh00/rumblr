
import path from "node:path";
import { fileURLToPath } from "node:url";

const client = process.env.DB_CLIENT || "sqlite3";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knexConfig = {
  client,
  connection:
    client === "sqlite3"
      ? {
          filename:
            process.env.DB_SQLITE_FILENAME ||
            path.resolve(__dirname, "../database.sqlite3"),
        }
      : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE_NAME,
          ssl:
            process.env.DB_USE_SSL === "true"
              ? { rejectUnauthorized: false }
              : false,
        },
  useNullAsDefault:
    client === "sqlite3"
      ? process.env.DB_USE_NULL_AS_DEFAULT === "true"
      : undefined,
  migrations: {
    directory: path.resolve(__dirname, "../database/migrations"),
  },
  seeds: {
    directory: path.resolve(__dirname, "../database/seeds"),
  },
};

export default knexConfig;
