import dotenv from 'dotenv';
dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const isAdmin = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  next();
};

export default isAdmin;
