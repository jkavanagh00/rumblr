/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("messages", (table) => {
    // UUID primary key
    table.uuid("id").primary().defaultTo(knex.fn.uuid());

    // Foreign Key: The specific match this conversation belongs to
    table
      .uuid("rumble_id")
      .notNullable()
      .references("id")
      .inTable("rumbles")
      .onDelete("CASCADE");

    // Foreign Key: The user who sent the rumble message
    table
      .uuid("sender_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // TEXT content for the rumble bubble
    table.text("content").notNullable();

    // TIMESTAMP sent_at
    table.timestamp("sent_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTableIfExists("messages");
}
