export function up(knex) {
  return knex.schema.createTable("admins", (table) => {
    table.bigIncrements("id").primary();

    table.string("name", 150).notNullable();
    table.string("email", 150).notNullable().unique();
    table.string("password_hash", 255).notNullable();

    table
      .enu("role", ["superadmin", "manager"])
      .notNullable()
      .defaultTo("manager");

    table.datetime("last_login_at").nullable();

    table
      .datetime("created_at")
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("admins");
}