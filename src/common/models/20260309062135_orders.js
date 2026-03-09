/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable("orders", (table) => {
    table.bigIncrements("id").primary();

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.string("order_number", 50).notNullable().unique();

    table
      .enu(
        "status",
        [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "failed",
        ],
        {
          useNative: false,
          enumName: "order_status_enum",
        }
      )
      .notNullable()
      .defaultTo("pending");

    table.decimal("subtotal_amount", 14, 2).notNullable().defaultTo(0);
    table.decimal("total_gst_amount", 14, 2).notNullable().defaultTo(0);
    table.decimal("total_amount", 14, 2).notNullable().defaultTo(0);

    table.string("shipping_name", 150).notNullable();
    table.string("shipping_email", 150).nullable();
    table.string("shipping_phone", 20).nullable();

    table.string("shipping_address_line1", 255).notNullable();
    table.string("shipping_address_line2", 255).nullable();
    table.string("shipping_city", 100).notNullable();
    table.string("shipping_state", 100).notNullable();
    table.string("shipping_postal_code", 20).notNullable();
    table.string("shipping_country", 100).notNullable().defaultTo("India");

    table
      .enu("gst_type", ["cgst_sgst", "igst"], {
        useNative: false,
        enumName: "gst_type_enum",
      })
      .notNullable();

    table.text("notes").nullable();

    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    table.index(["user_id"], "idx_orders_user_id");
    table.index(["status"], "idx_orders_status");
    table.index(["created_at"], "idx_orders_created_at");
  });
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("orders");
}