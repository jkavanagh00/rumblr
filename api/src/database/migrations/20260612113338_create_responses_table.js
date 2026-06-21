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
      .uuid("question_id")
      .notNullable()
      .references("id")
      .inTable("questions")
      .onDelete("CASCADE");

    // NUMBER value (using integer for scale/numeric metrics)
    table.integer("value").notNullable();

    // TIMESTAMP created_at
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down (knex) {return knex.schema.dropTableIfExists('responses');}
