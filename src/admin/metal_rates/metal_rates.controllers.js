
import * as Service from "./metal_rates.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};

export const addMetalRate = async (req, res) => {
  try {
    const result = await Service.createMetalRate(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};

export const getAllMetalRates = async (req, res) => {
  try {
    const result = await Service.listMetalRates( req.query );
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const updateMetalRate = async (req, res) => {
  try {
    const result = await Service.updateMetalRate(req.params.metalRateId, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};


export const deleteMetalRate = async (req, res) => {
  try {
    const result = await Service.deleteMetalRate(req.params.id);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
};