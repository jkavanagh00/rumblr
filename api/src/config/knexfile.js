const client = process.env.DB_CLIENT || "sqlite3";

const knexConfig = {
  client,
  connection:
    client === "sqlite3"
      ? {
          filename: process.env.DB_SQLITE_FILENAME || "./src/database.sqlite3",
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
    directory: "./src/database/migrations",
  },
  seeds: {
    directory: "./src/database/seeds",
  },
};

export default knexConfig;
