
import * as Service from "./stone_rates.service.js";


const sendResponse = (res, result) => {
  return res.status(result.statusCode).json({
    status: result.status,
    message: result.message,
    data: result.data ?? null
  });
};



export const addStoneRate = async (req, res) => {
  try {
    const result = await Service.createStoneRate(req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const getAllStoneRates = async (req, res) => {
  try {
    const result = await Service.listStoneRates(req.query);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const updateStoneRate = async (req, res) => {
  try {
    const result = await Service.updateStoneRate(req.params.stoneRateId, req.body);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const changeStatusStoneRate = async (req, res) => {
  try {
    const result = await Service.changeStoneRateStatus(req.params.stoneRateId, req.body.status);
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const deleteStoneRate = async (req, res) => {
  try {
    const result = await Service.deleteStoneRate(req.params.stoneRateId);
    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Stone rate not found"
      });
    }
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}

export const getLatestStoneRate = async (req, res) => {
  try {
    const { stone_type, clarity_grade, color_grade, onDate } = req.query;
    const result = await Service.getLatestStoneRate({ stone_type, clarity_grade, color_grade, onDate });
    return sendResponse(res, result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong"
    });
  }
}