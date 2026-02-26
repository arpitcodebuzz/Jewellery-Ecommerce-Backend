import db from "../../common/config/db.js";

export async function createMetalRate(payload) {
  const row = {
    metal_type: payload.metal_type,
    purity_code: payload.purity_code,
    rate_per_gram: payload.rate_per_gram,
    effective_from: payload.effective_from || db.fn.now(),
  };

  // Prevent duplicate rate entries for same day + same metal + purity
  const existing = await db("metal_rates")
    .where({ metal_type: row.metal_type, purity_code: row.purity_code })
    .whereRaw("DATE(effective_from) = DATE(?)", [row.effective_from])
    .first();

  if (existing) return { status: false, statusCode: 400, message: "Metal rate already exists" };
  const [id] = await db("metal_rates").insert(row);
  const metalRate = await db("metal_rates").where({ id }).first();

  return { status: true, statusCode: 200, data: metalRate };
}

export async function getMetalRateById(id) {
  return db("metal_rates").where({ id }).first();
}

export async function listMetalRates({ metal_type, purity_code, from, to, page = 1, limit = 20 }) {
  const q = db("metal_rates");

  if (metal_type) q.where("metal_type", metal_type);
  if (purity_code) q.where("purity_code", purity_code);
  if (from) q.where("effective_from", ">=", from);
  if (to) q.where("effective_from", "<=", to);

  const [{ count }] = await q.clone().count({ count: "*" });

  const data = await q
    .clone()
    .orderBy("effective_from", "desc")
    .limit(limit)
    .offset((page - 1) * limit);

  return { status: true, statusCode: 200, data, meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
}

// Latest for a specific metal_type + purity_code
export async function getLatestMetalRate({ metal_type, purity_code }) {
  return db("metal_rates")
    .where({ metal_type, purity_code })
    .orderBy("effective_from", "desc")
    .first();
}

/**
 * Latest for ALL (metal_type, purity_code) pairs
 * Requires MySQL 8+ (window functions).
 */
export async function getLatestMetalRatesAll() {
  const rows = await db.raw(`
    SELECT id, metal_type, purity_code, rate_per_gram, effective_from, created_at
    FROM (
      SELECT
        mr.*,
        ROW_NUMBER() OVER (PARTITION BY metal_type, purity_code ORDER BY effective_from DESC, id DESC) AS rn
      FROM metal_rates mr
    ) t
    WHERE t.rn = 1
    ORDER BY metal_type ASC, purity_code ASC
  `);

  // knex raw returns [rows, fields] on mysql2
  return rows[0] ?? rows;
}

export async function updateMetalRate(id, patch) {

  //before updating, check if the record exists or not
  const existing = await db("metal_rates").where({ id }).first();
  if (!existing) return { status: false, statusCode: 404, message: "Metal rate not found" };

  await db("metal_rates").where({ id }).update(patch);

  return { status: true, statusCode: 200, message: "Metal rate updated", data:null };
}

export async function deleteMetalRate(id) {

  const existing = await db("metal_rates").where({ id }).first();
  if (!existing) return { status: false, statusCode: 404, message: "Metal rate not found" };

  return db("metal_rates").where({ id }).del();
}