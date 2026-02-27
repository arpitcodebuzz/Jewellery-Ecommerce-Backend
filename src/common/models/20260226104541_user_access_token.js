// 20260220050000_create_user_access_token.js
// (rename timestamp as needed, just keep order after users table)

export async function up(knex) {
  await knex.schema.createTable("user_access_token", (table) => {
    table.increments("id").primary();

    table
      .integer("user_id")
      .unsigned()
      .notNullable();

    table.string("token_hash", 255).notNullable();

    table.boolean("revoked").notNullable().defaultTo(false);

    table.timestamp("expires_at").notNullable();

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());

    // Extra info for multiple devices / sessions
    table.string("device", 100).nullable();
    table.string("user_agent", 255).nullable();

    // Normal index (NOT unique) for fast lookup
    table.index("user_id", "idx_user_access_token_user_id");

    // Foreign key to users(id)
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("user_access_token");
}