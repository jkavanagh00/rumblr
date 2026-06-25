/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up (knex) {
  return knex.schema.createTable("responses", (table) => {
    // UUID primary key
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // Foreign Key to USERS table
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Foreign Key to QUESTIONS table
    table
      .uuid("statement_id")
      .notNullable()
      .references("id")
      .inTable("statements")
      .onDelete("CASCADE");

    // NUMBER value (using integer for scale/numeric metrics)
    table.integer("agreement_score").notNullable();
    table.integer("importance_score").notNullable();

    table.check("agreement_score >= 1 AND agreement_score <= 5");
    table.check("importance_score >= 1 AND importance_score <= 5");

    // add indexes on user_id and statement_id for faster lookups
    table.index(["user_id", "statement_id"], "user_response_index");

    // add a unique constraint to prevent duplicate responses from the same user to the same statement
    table.unique(["user_id", "statement_id"], "unique_user_statement_response");

    // TIMESTAMP created_at
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down (knex) {return knex.schema.dropTableIfExists('responses');}
