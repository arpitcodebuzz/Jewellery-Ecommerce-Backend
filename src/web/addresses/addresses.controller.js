import * as service from './addresses.service.js';

const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const addAddresses = async (req, res) => {
  try {
    const result = await service.addAddresseService(req.user.id,req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log("error in addAddresses controller",error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const getAllAddresses = async (req, res) => {
  try {
    const result = await service.getAllAddressesService(req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log("error in getAllAddresses controller",error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const getAddressById = async(req,res)=>{
  try {
    const result = await service.getAddressByIdService(req.params.addressId,req.user.id);
    return sendResponse(res, result);
    
  } catch (error) {
    console.log("error in getAddressById controller",error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const updateAddress = async(req,res)=>{
  try {
    const result = await service.updateAddressService(req.params.addressId,req.user.id,req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log("error in updateAddress controller",error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const deleteAddress = async(req,res)=>{
  try {
    const result = await service.deleteAddressService(req.params.addressId,req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log("error in deleteAddress controller",error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const setAddressDefault = async(req,res)=>{
  try {
    const result = await service.setAddressDefaultService(req.params.addressId,req.user.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log("error in setAddressDefault controller",error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}