import db from "../../common/config/db.js";

const ensureProductExists = async (productId) => {
  return db("products").where({ id: productId }).first();
};

const normalizeStonePayload = (payload) => {
  const clean = (v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const s = String(v).trim();
    return s === "" ? null : s;
  };

  return {
    stone_type: payload.stone_type !== undefined ? String(payload.stone_type).trim().toLowerCase() : undefined,
    clarity_grade: clean(payload.clarity_grade),
    color_grade: clean(payload.color_grade),
    cut_grade: clean(payload.cut_grade),
    weight_carat: payload.weight_carat,
    piece_count: payload.piece_count,
  };
};

export const addProductStone = async (productId, payload) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status: false, statusCode: 404, message: "Product not found" };

  const data = normalizeStonePayload(payload);

  // Backup numeric checks (Joi should already validate)
  if (!data.weight_carat || Number(data.weight_carat) <= 0) {
    return { status: false, statusCode: 400, message: "weight_carat must be greater than 0" };
  }

  const pieceCount = data.piece_count ?? 1;
  if (Number(pieceCount) < 1) {
    return { status: false, statusCode: 400, message: "piece_count must be at least 1" };
  }

  // Diamond rules (business requirement)
  if (data.stone_type === "diamond") {
    if (!data.clarity_grade || !data.color_grade) {
      return {
        status: false,
        statusCode: 400,
        message: "clarity_grade and color_grade are required for diamond",
      };
    }
  }

  // ✅ Duplicate check (block, don’t merge)
  const existing = await db("product_stone_components")
    .where({
      product_id: productId,
      stone_type: data.stone_type,
      clarity_grade: data.clarity_grade ?? null,
      color_grade: data.color_grade ?? null,
      cut_grade: data.cut_grade ?? null,
    })
    .first();

  if (existing) {
    return {
      status: false,
      statusCode: 409,
      message: "Stone with same type/quality already exists for this product",
      data: {
        id: existing.id,
        stone_type: existing.stone_type,
        clarity_grade: existing.clarity_grade,
        color_grade: existing.color_grade,
        cut_grade: existing.cut_grade,
      },
    };
  }

  // ✅ Insert new stone
  const [id] = await db("product_stone_components").insert({
    product_id: productId,
    stone_type: data.stone_type,
    clarity_grade: data.clarity_grade ?? null,
    color_grade: data.color_grade ?? null,
    cut_grade: data.cut_grade ?? null,
    weight_carat: data.weight_carat,
    piece_count: pieceCount,
  });

  const rows = await db("product_stone_components")
    .where({ product_id: productId })
    .orderBy("id", "asc");

  return { status: true, statusCode: 201,message: "Stone added successfully", data: rows, inserted_id: id };
};

export const listProductStones = async (productId) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status: false, statusCode: 404, message: "Product not found" };

  const rows = await db("product_stone_components")
    .where({ product_id: productId })
    .orderBy("id", "asc");

  return { status: true, statusCode: 200, data: rows };
};

export const updateProductStone = async (productId, stoneId, payload) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status: false, statusCode: 404, message: "Product not found" };

  const current = await db("product_stone_components")
    .where({ id: stoneId, product_id: productId })
    .first();

  if (!current) {
    return { status: false, statusCode: 404, message: "Stone component not found" };
  }

  const data = normalizeStonePayload(payload);

  // Build final values AFTER applying patch (so we validate correctly)
  const finalStoneType = data.stone_type !== undefined ? data.stone_type : current.stone_type;
  const finalClarity = data.clarity_grade !== undefined ? data.clarity_grade : current.clarity_grade;
  const finalColor = data.color_grade !== undefined ? data.color_grade : current.color_grade;
  const finalCut = data.cut_grade !== undefined ? data.cut_grade : current.cut_grade;
  const finalWeight = data.weight_carat !== undefined ? data.weight_carat : current.weight_carat;
  const finalPieces = data.piece_count !== undefined ? data.piece_count : current.piece_count;

  // ✅ Backup numeric checks
  if (finalWeight === null || Number(finalWeight) <= 0) {
    return { status: false, statusCode: 400, message: "weight_carat must be greater than 0" };
  }

  if (finalPieces === null || Number(finalPieces) < 1) {
    return { status: false, statusCode: 400, message: "piece_count must be at least 1" };
  }

  // ✅ Diamond rules
  if (finalStoneType === "diamond") {
    if (!finalClarity || !finalColor) {
      return {
        status: false,
        statusCode: 400,
        message: "clarity_grade and color_grade are required for diamond",
      };
    }
  }

  // ✅ Duplicate check (block, don’t merge)
  // Define what “duplicate” means: same product + stone_type + clarity + color + cut
  const duplicate = await db("product_stone_components")
    .where({
      product_id: productId,
      stone_type: finalStoneType,
      clarity_grade: finalClarity ?? null,
      color_grade: finalColor ?? null,
      cut_grade: finalCut ?? null,
    })
    .andWhereNot({ id: stoneId })
    .first();

  if (duplicate) {
    return {
      status: false,
      statusCode: 409,
      message: "Stone with same type/quality already exists for this product",
      // optional: help frontend show which row is conflicting
      data: {
        id: duplicate.id,
        stone_type: duplicate.stone_type,
        clarity_grade: duplicate.clarity_grade,
        color_grade: duplicate.color_grade,
        cut_grade: duplicate.cut_grade,
      },
    };
  }

  // ✅ Update safe
  await db("product_stone_components")
    .where({ id: stoneId })
    .update({
      ...(data.stone_type !== undefined ? { stone_type: data.stone_type } : {}),
      ...(data.clarity_grade !== undefined ? { clarity_grade: data.clarity_grade } : {}),
      ...(data.color_grade !== undefined ? { color_grade: data.color_grade } : {}),
      ...(data.cut_grade !== undefined ? { cut_grade: data.cut_grade } : {}),
      ...(data.weight_carat !== undefined ? { weight_carat: data.weight_carat } : {}),
      ...(data.piece_count !== undefined ? { piece_count: data.piece_count } : {}),
    });

  const rows = await db("product_stone_components")
    .where({ product_id: productId })
    .orderBy("id", "asc");

  return { status: true, statusCode: 200, data: rows };
};

export const deleteProductStone = async (productId, stoneId) => {
  const product = await ensureProductExists(productId);
  if (!product) return { status: false, statusCode: 404, message: "Product not found" };

  const stone = await db("product_stone_components")
    .where({ id: stoneId, product_id: productId })
    .first();

  if (!stone) return { status: false, statusCode: 404, message: "Stone component not found" };

  await db("product_stone_components").where({ id: stoneId }).del();

  const rows = await db("product_stone_components")
    .where({ product_id: productId })
    .orderBy("id", "asc");

  return { status: true, statusCode: 200, data: rows };
};