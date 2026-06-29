/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("blocks", (table) => {
    // UUID primary key
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // Foreign Key: The user who is doing the blocking
    table
      .uuid("blocker_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Foreign Key: The user who is being blocked
    table
      .uuid("blocked_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // TIMESTAMP created_at
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("blocks");
}
