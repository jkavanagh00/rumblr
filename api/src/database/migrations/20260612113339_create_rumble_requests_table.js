/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  // We must return the schema creation wrapper here
  return knex.schema.createTable("rumble_requests", (table) => {
    // UUID primary key
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // Foreign Key: The user who initiated the challenge
    table
      .uuid("requester_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Foreign Key: The user receiving the challenge
    table
      .uuid("receiver_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // ENUM status (e.g., pending challenge, accepted, or declined)
    table
      .enum("status", ["pending", "accepted", "declined"])
      .notNullable()
      .defaultTo("pending");

    // TIMESTAMP created_at
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("rumble_requests");
}
