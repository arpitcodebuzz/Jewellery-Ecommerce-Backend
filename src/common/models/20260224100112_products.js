// migrations/20260224145000_create_products_table.js

export async function up(knex) {
  await knex.schema.createTable("products", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 255).notNullable();
    table.string("sku", 100).notNullable().unique();

    table
      .enu("product_type", [
        "ring",
        "earring",
        "pendant",
        "kada",
        "bracelet",
        "chain",
        "coin",
        "bar",
      ])
      .notNullable();

    table.enu("target_gender", ["men", "women", "unisex"]).notNullable();

    // ✅ FK columns must match bigIncrements() => BIGINT UNSIGNED
    table
      .bigInteger("category_id")
      .unsigned()
      .notNullable()
      .index();

    table
      .bigInteger("collection_id")
      .unsigned()
      .nullable()
      .index();

    table.enu("default_metal_type", ["gold", "silver", "platinum"]).notNullable();

    table
      .enu("making_charge_type", ["per_gram", "fixed"])
      .notNullable();

    table.decimal("making_charge_value", 10, 2).notNullable().defaultTo(0);

    table.decimal("wastage_percent", 5, 2).notNullable().defaultTo(0);
    table.decimal("margin_percent", 5, 2).notNullable().defaultTo(0);

    table.decimal("gst_percent", 5, 2).notNullable().defaultTo(3.0);

    table.enu("status", ["active", "inactive"]).notNullable().defaultTo("active");

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign("category_id")
      .references("id")
      .inTable("categories")
      .onDelete("RESTRICT")
      .onUpdate("CASCADE");

    table
      .foreign("collection_id")
      .references("id")
      .inTable("collections")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("products");
}