import db from '../../common/config/db.js';
import { generateAccessToken } from '../../common/utils/jwt.js';
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';





export const createAdminservive = async(data)=>{

  const {name,email,password,role}= data;

  const adminExists = await db('admins').where({ email }).first();

  if (adminExists) {
    return{
      status:false,
      statusCode:400,
      message:"Admin already exists",
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const admin = await db('admins').insert({ name, email, password_hash: hashedPassword, role });

  return{
    status:true,
    statusCode:200,
    message:"Admin created successfully",
  }
}


export const loginAdmin = async(data)=>{

  const {email,password}= data;

  const admin = await db('admins').where({ email }).first();

  if (!admin) {
    return{
      status:false,
      statusCode:404,
      message:"Admin not found",
    }
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

  if (!isPasswordValid) {
    return{
      status:false,
      statusCode:401,
      message:"Invalid credentials",
    }
  }

  const accessToken = await generateAccessToken({ id: admin.id, role: admin.role });
  

  return{
    status:true,
    statusCode:200,
    message:"Admin logged in successfully",
    data:{accessToken}
  }
}




