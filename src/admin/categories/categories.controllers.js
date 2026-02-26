
import * as Service from "./categories.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const addCategory = async (req, res) => {
  try {
    const result = await Service.addCategory(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const getAllCategories = async (req, res) => {
  try {
    const result = await Service.getAllCategories();
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const result = await Service.updateCategory(req.params.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const result = await Service.deleteCategory(req.params.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};




