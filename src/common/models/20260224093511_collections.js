// migrations/20260224144000_create_collections_table.js

export async function up(knex) {
  await knex.schema.createTable("collections", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 100).notNullable();

    table.string("slug", 120).notNullable().unique();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("collections");
}