import db from "../../common/config/db.js";
function normalizeKey(v) {
  if (v === null || v === undefined) return "NA";
  const s = String(v).trim();
  return s.length ? s : "NA";
}

export async function createStoneRate(payload) {
  const clarity_grade = payload.clarity_grade ?? null;
  const color_grade = payload.color_grade ?? null;
  const cut_grade = payload.cut_grade ?? null;

  const clarity_key = normalizeKey(clarity_grade);
  const color_key = normalizeKey(color_grade);
  const cut_key = normalizeKey(cut_grade);

  // 🔎 Check duplicate (same combination + same effective date)
  const existing = await db("stone_rates")
    .where({
      stone_type: payload.stone_type,
      clarity_key,
      color_key,
      cut_grade: cut_key,
      effective_from: payload.effective_from,
    })
    .first();

  if (existing) {
    return {
      status: false,
      statusCode: 409,
      message: "Stone rate already exists for this combination and date",
    };
  }

  const row = {
    stone_type: payload.stone_type,

    // ✅ store original (can be NULL)
    clarity_grade,
    color_grade,

    // ✅ store normalized cut (NA instead of NULL)
    cut_grade: cut_key,

    rate_per_carat: payload.rate_per_carat,
    effective_from: payload.effective_from,
    status: payload.status ?? "active",

    // ✅ store normalized keys for matching
    clarity_key,
    color_key,
  };

  const [id] = await db("stone_rates").insert(row);
  const created = await db("stone_rates").where({ id }).first();

  return {
    status: true,
    statusCode: 201,
    message: "Stone rate created successfully",
    data: created,
  };
}

export async function getStoneRateById(id) {
  const row = await db("stone_rates").where({ id }).first();
  return { status: true, statusCode: 200, data: row || null };
}

export async function listStoneRates(filters) {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 20);
  const offset = (page - 1) * limit;

  const q = db("stone_rates");

  if (filters.stone_type) q.where("stone_type", filters.stone_type);

  // For filters, allow matching either raw grade OR key (depends on your schema)
  if (filters.clarity_grade !== undefined) {
    const key = normalizeKey(filters.clarity_grade);
    if (await hasColumn("stone_rates", "clarity_key")) {
      q.where("clarity_key", key);
    } else {
      q.where("clarity_grade", filters.clarity_grade);
    }
  }

  if (filters.color_grade !== undefined) {
    const key = normalizeKey(filters.color_grade);
    if (await hasColumn("stone_rates", "color_key")) {
      q.where("color_key", key);
    } else {
      q.where("color_grade", filters.color_grade);
    }
  }

  if (filters.status) q.where("status", filters.status);

  if (filters.from) q.andWhere("effective_from", ">=", filters.from);
  if (filters.to) q.andWhere("effective_from", "<=", filters.to);

  // total count
  const countRow = await q.clone().count({ total: "*" }).first();
  const total = Number(countRow?.total || 0);

  const data = await q
    .clone()
    .orderBy("effective_from", "desc")
    .orderBy("id", "desc")
    .limit(limit)
    .offset(offset);

  return { status: true, statusCode: 200, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateStoneRate(id, payload) {
  const exists = await db("stone_rates").where({ id }).first();
  if (!exists) return null;

  const updateData = { ...payload };

  // Normalize empty string -> null for grades
  if ("clarity_grade" in updateData) {
    updateData.clarity_grade =
      updateData.clarity_grade === "" ? null : updateData.clarity_grade;
  }
  if ("color_grade" in updateData) {
    updateData.color_grade =
      updateData.color_grade === "" ? null : updateData.color_grade;
  }
  if ("cut_grade" in updateData) {
    updateData.cut_grade =
      updateData.cut_grade === "" ? null : updateData.cut_grade;
  }

  // Update keys if columns exist
  if (await hasColumn("stone_rates", "clarity_key")) {
    if ("clarity_grade" in updateData) {
      updateData.clarity_key = normalizeKey(updateData.clarity_grade);
    }
  }
  if (await hasColumn("stone_rates", "color_key")) {
    if ("color_grade" in updateData) {
      updateData.color_key = normalizeKey(updateData.color_grade);
    }
  }

  // updated_at if exists
  if (await hasColumn("stone_rates", "updated_at")) {
    updateData.updated_at = db.fn.now();
  }

  await db("stone_rates").where({ id }).update(updateData);
  return { status: true, message: "Success", message: "Stone rate updated", data: null };
}

export async function changeStoneRateStatus(id, status) {
  const exists = await db("stone_rates").where({ id }).first();
  if (!exists) return null;

  const updateData = { status };
  if (await hasColumn("stone_rates", "updated_at")) {
    updateData.updated_at = db.fn.now();
  }

  await db("stone_rates").where({ id }).update(updateData);

  return { status: true, message: "Success", message: "Stone rate status updated", data: null };
}

// Fetch latest rate used by price engine
export async function getLatestStoneRate({ stone_type, clarity_grade, color_grade, onDate }) {
  const clarityKey = normalizeKey(clarity_grade);
  const colorKey = normalizeKey(color_grade);

  // const q = db("stone_rates")
  //   .where("stone_type", stone_type)
  //   .where("status", "active");

  // // Prefer *_key if present, else fallback to grade
  // if (await hasColumn("stone_rates", "clarity_key")) q.where("clarity_key", clarityKey);
  // else q.where("clarity_grade", clarity_grade ?? null);

  // if (await hasColumn("stone_rates", "color_key")) q.where("color_key", colorKey);
  // else q.where("color_grade", color_grade ?? null);

  // if (onDate) q.andWhere("effective_from", "<=", onDate);

  // const row = await q.orderBy("effective_from", "desc").first();

  //if date is not provided, we get the latest active rate
  if (!onDate) {
    const row = await db("stone_rates")
      .where("stone_type", stone_type)
      .where("status", "active")
      .orderBy("effective_from", "desc")
      .first();
    return { status: true, statusCode: 200, data: row || null };
  }else {
    const row = await db("stone_rates")
      .where("stone_type", stone_type)
      .where("status", "active")
      .where("effective_from", "<=", onDate)
      .orderBy("effective_from", "desc")
      .first();
    return { status: true, statusCode: 200, data: row || null };
  }


}

export async function deleteStoneRate(id) {
  const exists = await db("stone_rates").where({ id }).first();
  if (!exists) return null;

  await db("stone_rates").where({ id }).del();
  return { status: true, statusCode: 200, message: "Stone rate deleted successfully" };
}

/* ---------- helper: check if column exists ---------- */
async function hasColumn(tableName, columnName) {
  const cols = await db(tableName).columnInfo();
  return Object.prototype.hasOwnProperty.call(cols, columnName);
}