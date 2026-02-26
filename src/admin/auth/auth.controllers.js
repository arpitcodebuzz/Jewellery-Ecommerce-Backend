import { revokAdminTokenByValue } from "../../common/utils/jwt.js";
import * as Service from "./auth.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const createAdmin = async (req, res) => {
  try {
    const result = await Service.createAdminservive(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}


export const loginAdmin = async (req, res) => {
  try {
    const result = await Service.loginAdmin(req.body);
    return sendResponse(res, result);
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}



export const logoutAdmin = async (req, res) => {
try {
    const authUser = req.headers.authorization;

    if(!authUser || !authUser.startsWith("Bearer ")){
      return res.status(401).json({
        status: false,
        message: "Authorization token required"
      });
    }
    const token = authUser.split(" ")[1];
    await revokAdminTokenByValue(token);

    return res.status(200).json({
      status: true,
      message: "Logout successfully",
      data: null
    })
    
} catch (error) {

  console.log(error);
  return res.status(500).json({
    status: false,
    message: "Something went wrong"
  });
  
}
}




