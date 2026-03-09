import db from "../../common/config/db.js";
import { up } from "../../common/models/20260309040406_user_addresses.js";

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
const sanitizeAddressRow = (row) => {
  if (!row) return row;

  return {
    id: row.id,
    user_id: row.user_id,
    full_name: row.full_name,
    phone: row.phone,
    address_line1: row.address_line1,
    address_line2: row.address_line2,
    city: row.city,
    state: row.state,
    postal_code: row.postal_code,
    country: row.country,
    is_default: Boolean(row.is_default),
    address_type: row.address_type,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

const getAddressByIdAndUser = async (id, userId) => {
  return db("user_addresses")
    .where({ id, user_id: userId })
    .first();
};

/*
|--------------------------------------------------------------------------
| Create Address
|--------------------------------------------------------------------------
*/
export const addAddresseService = async (userId, payload) => {
  const trx = await db.transaction();
  try {
    const addressData = {
      user_id: userId,
      full_name: payload.full_name,
      phone: payload.phone,
      address_line1: payload.address_line1,
      address_line2: payload.address_line2 ?? null,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postal_code,
      country: payload.country ?? "India",
      is_default: payload.is_default ?? false,
      address_type: payload.address_type ?? "home",
    };

    const existingCountRow = await trx("user_addresses")
      .where({ user_id: userId })
      .count({ total: "*" })
      .first();

    const existingCount = Number(existingCountRow?.total || 0);

    // If the user has no addresses yet, set the new address as default
    if (existingCount === 0) {
      addressData.is_default = true;
    }

    //if is this adress is default, unset others
    if (addressData.is_default) {
      await trx("user_addresses")
        .where({ user_id: userId })
        .update({ is_default: false });
    }

    await trx("user_addresses").insert(addressData);
    await trx.commit();
    return { status: true, statusCode: 200, message: "Address added successfully" };

  } catch (error) {
    await trx.rollback();
    return { status: false, statusCode: 400, message: error.message };
  }

}


export const getAllAddressesService = async (userId) => {
 const rows = await db("user_addresses")
    .where({ user_id: userId })
    .orderBy([
      { column: "is_default", order: "desc" },
      { column: "id", order: "desc" },
    ]);

    if (rows.length === 0) return { status: true, statusCode: 200, data: [] };
    return { status: true, statusCode: 200, data: rows.map((row) => sanitizeAddressRow(row)) };
};

export const getAddressByIdService = async (id, userId) => {
  const row = await getAddressByIdAndUser(id, userId);
  if (!row) return { status: false, statusCode: 404, message: "Address not found" };
  return { status: true, statusCode: 200, data: sanitizeAddressRow(row) };
};


export const updateAddressService = async (id,userId,payload) => {
  const trx = await db.transaction();
  try {
  const existing = await trx("user_addresses").where({ id, user_id: userId }).first();

  if(!existing) return { status: false, statusCode: 404, message: "Address not found" };

  const updateData = {};

  if(payload.full_name !== undefined) updateData.full_name = payload.full_name;
  if(payload.phone !== undefined) updateData.phone = payload.phone;
  if(payload.address_line1 !== undefined) updateData.address_line1 = payload.address_line1;
  if(payload.address_line2 !== undefined) updateData.address_line2 = payload.address_line2;
  if(payload.city !== undefined) updateData.city = payload.city;
  if(payload.state !== undefined) updateData.state = payload.state;
  if(payload.postal_code !== undefined) updateData.postal_code = payload.postal_code;
  if(payload.country !== undefined) updateData.country = payload.country;
  if(payload.is_default !== undefined) updateData.is_default = payload.is_default;
  if(payload.address_type !== undefined) updateData.address_type = payload.address_type;

  if(updateData.is_default) {
    await trx("user_addresses")
      .where({ user_id: userId })
      .update({ is_default: false });
  }

  await trx("user_addresses").where({ id, user_id: userId }).update(updateData);

  await trx.commit();

  return { status: true, statusCode: 200, message: "Address updated successfully" };
  } catch (error) {
    await trx.rollback();
    return { status: false, statusCode: 400, message: error.message };
  }
}



export const deleteAddressService = async (id, userId) => {
const trx = await db.transaction();
try {
  const existing = await trx("user_addresses").where({ id, user_id: userId }).first();
  if(!existing) return { status: false, statusCode: 404, message: "Address not found" };

  await trx("user_addresses").where({ id, user_id: userId }).del();

  //if deleted addrress was default, promote latest address as default
  if (existing.is_default) {
    const latest = await trx("user_addresses")
      .where({ user_id: userId })
      .orderBy("id", "desc")
      .first();

    if (latest) {
      await trx("user_addresses").where({ id: latest.id }).update({ is_default: true });
    }
  }

  await trx.commit();
  return { status: true, statusCode: 200, message: "Address deleted successfully" };
} catch (error) {
  await trx.rollback();
  return { status: false, statusCode: 400, message: error.message };
}

}


export const  setAddressDefaultService = async (id, userId) => {
const trx = await db.transaction();
try {

  const existing = await trx("user_addresses").where({ id, user_id: userId }).first();
  if(!existing) return { status: false, statusCode: 404, message: "Address not found" };

  await trx("user_addresses")
    .where({ user_id: userId })
    .update({ is_default: false });

  await trx("user_addresses").where({ id, user_id: userId }).update({ is_default: true });

  await trx.commit();
  return { status: true, statusCode: 200, message: "Address set as default successfully" };
  
} catch (error) {
  await trx.rollback();
  return { status: false, statusCode: 400, message: error.message };
}
};

