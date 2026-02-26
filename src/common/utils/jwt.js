import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateAccessToken = async (payload, meta = {}) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  //check if the token is for user or admin if admin so strore it in admin_access_token

  // hash token
  const tokenHash = hashToken(token);

  // insert token into DB

//
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 365);

//if the token is for admin so store it in admin_access_token and if the token is for user so store it in user_access_token



if (payload.role === "admin" || payload.role === "superadmin") {
  await db("admin_access_token").insert({
    admin_id: payload.id,
    token_hash: tokenHash,
    revoked: false,
    expires_at: expiresAt,
    device: meta.device || null,
    user_agent: meta.userAgent || null,
  });
}else{
  await db("user_access_token").insert({
    user_id: payload.id,
    token_hash: tokenHash,
    revoked: false,
    expires_at: expiresAt,
    device: meta.device || null,
    user_agent: meta.userAgent || null,
  });
}

  return token;

};

// revoke only one token (used for "logout from this device")
export const revokeTokenByValue = async (token) => {
  const tokenHash = hashToken(token);


  await db("user_access_token")
    .where({ token_hash: tokenHash })
    .update({ revoked: true });
};

// revoke all tokens (used for "logout from all devices" or forgotPassword)
export const revokeAllTokensForUser = async (userId) => {
  await db("user_access_token")
    .where({ user_id: userId })
    .update({ revoked: true });
};


export const revokAdminTokenByValue = async (token) => {
  const tokenHash = hashToken(token);

  await db("admin_access_token")
    .where({ token_hash: tokenHash })
    .update({ revoked: true });
};
