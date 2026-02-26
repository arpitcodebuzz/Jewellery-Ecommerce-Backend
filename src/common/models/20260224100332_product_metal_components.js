// migrations/20260224151000_create_product_metal_components_table.js

export async function up(knex) {
  await knex.schema.createTable("product_metal_components", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .index();

    table
      .enu("metal_type", ["gold", "silver", "platinum"])
      .notNullable();

    table.string("purity_code", 10).notNullable(); // 22K, 18K, 925
    table.decimal("purity_value", 5, 2).notNullable(); // 91.6, 75, 92.5 etc.

    table.decimal("weight_grams", 10, 3).notNullable(); // 3.500g

    table.boolean("is_primary").notNullable().defaultTo(false);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("product_metal_components");
}