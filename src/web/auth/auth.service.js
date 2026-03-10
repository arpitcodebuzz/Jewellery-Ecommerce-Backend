import db from "../../common/config/db.js";
import bcrypt from "bcrypt";
import { generateOtp } from "../../common/utils/otp.js";
import { generateAccessToken, revokeAllTokensForUser} from "../../common/utils/jwt.js";
import {sendOtpEmail, sendWelcomeEmail,sendOrderPlacedEmail} from '../../common/utils/mailer.js'



// ================= OTP HELPER =================
const verifyOtp = async (userId, otp, purpose) => {
  const record = await db('user_otps').where({ user_id: userId, purpose }).first();

  if (!record) {
    return { status: false, statusCode: 400, message: 'Please request for otp first !!' };
  }

  if (record.otp !== otp) {
    return { status: false, statusCode: 400, message: 'Invalid otp !!' };
  }

  if (record.expires_at < new Date()) {
    return { status: false, statusCode: 400, message: 'Otp expired !!' };
  }

  await db('user_otps').where({ user_id: userId, purpose }).delete();
  return { status: true };
};

// ================= SEND OTP =================
export const sendOtpService = async ({ email, purpose }) => {
  let user = await db('users').where({ email }).first();

  if (user && purpose === 'VERIFY_EMAIL' && user.email_verified) {
    return { status: false, statusCode: 400, message: 'Email is already verified !!' };
  }

  if (!user && purpose === 'FORGOT_PASSWORD') {
    return { status: false, statusCode: 400, message: 'Email not found !!' };
  }

  if (!user && purpose === 'VERIFY_EMAIL') {
    const [id] = await db('users').insert({ email });
    user = await db('users').where({ id }).first();
  }

  await db('user_otps').where({ user_id: user.id, purpose }).delete();

  const otp = generateOtp();

  await db('user_otps').insert({
    user_id: user.id,
    otp,
    purpose,
    expires_at: db.raw("DATE_ADD(NOW(), INTERVAL 5 MINUTE)")
  });

   await sendOtpEmail(user.email, otp,purpose);
  return {
    status: true,
    statusCode: 200,
    message: 'Otp sent successfully !!',
    data: { otp } // remove in production
  };
};

// ================= VERIFY OTP =================
export const verifyOtpService = async ({ email, otp, purpose }) => {
  const user = await db('users').where({ email }).first();

  if (!user) {
    return { status: false, statusCode: 400, message: 'User not found !!' };
  }

  const otpResult = await verifyOtp(user.id, otp, purpose);
  if (!otpResult.status) return otpResult;

  const accessToken = await generateAccessToken({ id: user.id, role: 'user' });

  return {
    status: true,
    statusCode: 200,
    message: 'Otp verified successfully !!',
    data: { accessToken }
  };
};

// ================= VERIFY EMAIL =================
export const verifyEmailService = async ({ email, otp }) => {
  const user = await db('users').where({ email }).first();

  if (!user) {
    return { status: false, statusCode: 400, message: 'User not found !!' };
  }

  if(user && user.email_verified) {
    return { status: false, statusCode: 400, message: 'Email is already verified !!' };
  }


  const otpResult = await verifyOtp(user.id, otp, 'VERIFY_EMAIL');
  if (!otpResult.status) return otpResult;

  await db('users').where({ id: user.id }).update({ email_verified: 1 });

  return { status: true, statusCode: 200, message: 'Email verified successfully !!' };
};

// ================= CREATE ACCOUNT =================
export const createAccountService = async ({ email, name, phone, password }) => {
  const user = await db('users').where({ email }).first();

  if (!user || !user.email_verified) {
    return { status: false, statusCode: 400, message: 'Email is not verified !!' };
  }

  if (user.password) {
    return { status: false, statusCode: 400, message: 'Account already created please login !!' };
  }

  if(user.google_id || user.provider_Type === 'google') return { status: false, statusCode: 400, message: 'Account already created please login with google !!' };

  const hashedPassword = await bcrypt.hash(password, 10);

  await db('users').where({ id: user.id }).update({
    name,
    phone,
    password: hashedPassword
  });

  const accessToken = await generateAccessToken({ id: user.id, role: 'user' });
  await sendWelcomeEmail(user.email);
  return {
    status: true,
    statusCode: 200,
    message: 'Account created successfully !!',
    data: { accessToken }
  };
};

// ================= LOGIN =================
export const loginService = async ({ email, password }, meta) => {

  const user = await db("users").where({ email }).first();

  if (!user) {
    return { status: false, statusCode: 400, message: 'Please create an account first !!' };
  }

  if (!user.email_verified) {
    return { status: false, statusCode: 400, message: 'Email is not verified !!' };
  }

  if (!user.password) {
    return { status: false, statusCode: 400, message: 'Please create an account first or login with google !!' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { status: false, statusCode: 400, message: 'Invalid password !!' };
  }

  const accessToken = await generateAccessToken(
    { id: user.id, role: 'user' },
    {
      device: meta?.device,
      userAgent: meta?.userAgent
    }
  );

  return {
    status: true,
    statusCode: 200,
    message: 'Login successful !!',
    data: { accessToken }
  };
};

// ================= FORGOT PASSWORD =================
export const forgotPasswordService = async ({ email, password }) => {
  const user = await db('users').where({ email }).first();

  if (!user) {
    return { status: false, statusCode: 400, message: 'User not found !!' };
  }


  const hashedPassword = await bcrypt.hash(password, 10);

  await db('users').where({ id: user.id }).update({ password: hashedPassword });
  await revokeAllTokensForUser(user.id);

  const accessToken = await generateAccessToken({ id: user.id, role: 'user' });

  return { status: true, statusCode: 200, data: { accessToken }, message: 'Password updated successfully !!' };
};

// ================= CHANGE PASSWORD =================
export const changePasswordService = async ({ email, old_password, new_password }) => {
  const user = await db('users').where({ email }).first();

  if (!user) {
    return { status: false, statusCode: 400, message: 'User not found !!' };
  }

  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    return { status: false, statusCode: 400, message: 'Invalid old password !!' };
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);
  await db('users').where({ id: user.id }).update({ password: hashedPassword });
  await revokeAllTokensForUser(user.id);

  const accessToken = await generateAccessToken({ id: user.id, role: 'user' });

  return { status: true, statusCode: 200,data: { accessToken }, message: 'Password updated successfully !!' };
};

// ================= PROFILE =================
export const getProfileService = async (userId) => {
  const user = await db('users').where({ id: userId }).first();

  //do not return password in response
  delete user.password;

  if (!user) {
    return { status: false, statusCode: 400, message: 'User not found !!' };
  }

  return {
    status: true,
    statusCode: 200,
    message: 'Profile fetched successfully !!',
    data: user
  };
};

export const updateProfileService = async (userId, { name, phone }) => {
  const existing = await db('users').where({ phone }).first();

  if (existing && existing.id !== userId) {
    return { status: false, statusCode: 400, message: 'Phone number already exists !!' };
  }

  await db('users').where({ id: userId }).update({ name, phone });

  return { status: true, statusCode: 200, message: 'Profile updated successfully !!' };
};



export const googleLoginService = async (body) => {
  const {name, email, google_id} = body;
  const user = await db('users').where({ email }).first();

  if (user) {
    //check if the provider is google and if not then update and email_verified to true
    if (user.provider_Type !== 'google') {
      await db('users').where({ id: user.id }).update({ email_verified: 1, provider_Type: 'google' });
    }
    const accessToken = await generateAccessToken({ id: user.id, role: 'user' });
    return {
      status: true,
      statusCode: 200,
      message: 'Login successful !!',
      data: { accessToken }
    };
  } else {
    const newUser = await db('users').insert({ name, email, google_id, email_verified: 1, provider_Type: 'google' });
    const accessToken = await generateAccessToken({ id: newUser[0], role: 'user' });
    return {
      status: true,
      statusCode: 200,
      message: 'Login successful !!',
      data: { accessToken }
    };
  } 
};


