/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("rumbles", (table) => {
    // UUID primary key
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // Foreign Key: Links directly to the request that generated this match
    table
      .uuid("rumble_request_id")
      .notNullable()
      .references("id")
      .inTable("rumble_requests")
      .onDelete("CASCADE");

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

    // ENUM status (e.g., scheduled, active, completed, cancelled)
    table
      .enum("status", ["pending", "active", "completed", "cancelled"])
      .notNullable()
      .defaultTo("scheduled");

    // TIMESTAMP created_at
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("rumbles");
}
