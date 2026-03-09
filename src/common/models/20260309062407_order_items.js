/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable("order_items", (table) => {
    table.bigIncrements("id").primary();

    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");

    table
      .bigInteger("product_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("products")
      .onDelete("RESTRICT");

    table.integer("quantity").unsigned().notNullable().defaultTo(1);

    // Product snapshot
    table.string("product_name", 255).notNullable();
    table.string("product_sku", 100).notNullable();

    // Price snapshot
    table.decimal("unit_price", 14, 2).notNullable().defaultTo(0);
    table.decimal("total_price", 14, 2).notNullable().defaultTo(0);

    table.decimal("metal_cost", 14, 2).notNullable().defaultTo(0);
    table.decimal("stone_cost", 14, 2).notNullable().defaultTo(0);
    table.decimal("making_charge", 14, 2).notNullable().defaultTo(0);
    table.decimal("wastage_amount", 14, 2).notNullable().defaultTo(0);
    table.decimal("margin_amount", 14, 2).notNullable().defaultTo(0);
    table.decimal("gst_amount", 14, 2).notNullable().defaultTo(0);

    table.decimal("gst_percent", 5, 2).notNullable().defaultTo(3.00);

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());

    table.index(["order_id"], "idx_order_items_order_id");
    table.index(["product_id"], "idx_order_items_product_id");
  });
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("order_items");
}