
import * as Service from "./collection.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const addCollection = async (req, res) => {
  try {
    const result = await Service.addCollection(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};

export const getAllCollections = async (req, res) => {
  try {
    const result = await Service.getAllCollections();
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};



export const updateCollection = async (req, res) => {
  try {
    const result = await Service.updateCollection(req.params.id, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const deleteCollection = async (req, res) => {
  try {
    const result = await Service.deleteCollection(req.params.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};





