// auth.middleware.js
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js"; // adjust path

const JWT_SECRET = process.env.JWT_SECRET;

//==============================================================================
/**
 * helper function: Hash JWT token (one-way) for DB comparison
 */
const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};
//==============================================================================


const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required"
      });
    }

    const token = authHeader.split(" ")[1];

    // 1️⃣ Verify JWT (signature + expiry)
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded example:
    // {
    //   id: user_id,
    //   role: "admin" | "user",
    //   iat,
    //   exp
    // }

    // 2️⃣ Hash incoming token
    const tokenHash = hashToken(token);

    // 3️⃣ Compare with DB
    
  if(decoded.role === "admin" || decoded.role === "superadmin") {
    const session = await db("admin_access_token").where({ token_hash: tokenHash }).first();
    if (!session || session.revoked) {
      return res.status(401).json({
        success: false,
        message: "Token revoked or invalid"
      });
    }

  }else{
    const session = await db("user_access_token").where({ token_hash: tokenHash }).first();
     if (!session || session.revoked) {
      return res.status(401).json({
        success: false,
        message: "Token revoked or invalid"
      });
    }
  }

    // 4️⃣ Attach user info
    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default authMiddleware;
