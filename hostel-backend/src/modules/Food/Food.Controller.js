import AppError from "../../utils/AppError.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { successResponse } from "../../utils/ApiResponse.js";

import {
  upsertMenuService,
  getMenuByDateService,
  createWeeklyMenuService,
  getWeeklyMenuService
} from "../Food/Food.Service.js";


// DAILY
export const upsertMenu = asyncHandler(async (req, res) => {
  const { date, meals } = req.body;

  if (!date || !meals || !Array.isArray(meals)) {
    throw new AppError("Date and meals are required", 400);
  }

  const result = await upsertMenuService(date, meals);

  return successResponse(res, {
    statusCode: 200,
    message: "Menu updated successfully",
    data: result
  });
});


// GET DAILY — defaults to today if no date provided
export const getMenu = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const menu = await getMenuByDateService(date);

  return successResponse(res, {
    statusCode: 200,
    message: menu ? "Menu fetched successfully" : "No menu set for this date",
    data: menu
  });
});


// WEEKLY
export const createWeeklyMenu = asyncHandler(async (req, res) => {
  const { startDate, menus } = req.body;

  if (!startDate || !menus || !Array.isArray(menus)) {
    throw new AppError("startDate and menus are required", 400);
  }

  const result = await createWeeklyMenuService(startDate, menus);

  return successResponse(res, {
    statusCode: 200,
    message: "Weekly menu created successfully",
    data: result
  });
});

export const getWeeklyMenu = asyncHandler(async (req, res) => {
  const { startDate } = req.query;

  if (!startDate) {
    throw new AppError("startDate is required", 400);
  }

  const menus = await getWeeklyMenuService(startDate);

  return successResponse(res, {
    statusCode: 200,
    message: "Weekly menu fetched successfully",
    data: menus
  });
});