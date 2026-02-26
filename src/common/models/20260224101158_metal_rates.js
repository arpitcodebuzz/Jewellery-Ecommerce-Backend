// migrations/20260224153000_create_metal_rates_table.js

export async function up(knex) {
  await knex.schema.createTable("metal_rates", (table) => {
    table.bigIncrements("id").primary();

    table
      .enu("metal_type", ["gold", "silver", "platinum"])
      .notNullable()
      .index();

    table.string("purity_code", 10).notNullable().index(); // 22K, 18K, 925

    table.decimal("rate_per_gram", 12, 2).notNullable();

    table.date("effective_from").notNullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    // Prevent duplicate rate entries for same day + same metal + purity
    table.unique(["metal_type", "purity_code", "effective_from"], "uq_metal_rates_day");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("metal_rates");
}