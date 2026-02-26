// YYYYMMDDHHMMSS_create_admin_access_token.js

export function up(knex) {
  return knex.schema.createTable("admin_access_token", (table) => {
    table.increments("id").primary();

    // IMPORTANT: must match admins.id → bigIncrements()
    table.bigInteger("admin_id").unsigned().notNullable();

    table.string("token_hash", 255).notNullable();
    table.boolean("revoked").notNullable().defaultTo(false);
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.string("device", 100).nullable();
    table.string("user_agent", 255).nullable();

    table.index("admin_id");

    table
      .foreign("admin_id")
      .references("id")
      .inTable("admins")
      .onDelete("CASCADE");
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("admin_access_token");
}