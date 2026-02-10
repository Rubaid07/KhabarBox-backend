import { Request, Response } from "express";
import { providerDashboardService } from "./providerDashboard.service";

const getStats = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const stats = await providerDashboardService.getStats(user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getRecentOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const result = await providerDashboardService.getRecentOrders(user.id, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getPopularMeals = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const limit = Number(req.query.limit) || 5;

    const result = await providerDashboardService.getPopularMeals(
      user.id,
      limit
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getWeeklyChart = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const result = await providerDashboardService.getWeeklyChart(user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

const getMyMeals = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    const options: { page: number; limit: number; isAvailable?: boolean } = {
      page,
      limit,
    };

    if (req.query.isAvailable === "true") {
      options.isAvailable = true;
    } else if (req.query.isAvailable === "false") {
      options.isAvailable = false;
    }

    const result = await providerDashboardService.getMyMeals(user.id, options);

    res.json({ success: true, ...result });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const ProviderDashboardController = {
  getStats,
  getRecentOrders,
  getPopularMeals,
  getWeeklyChart,
  getMyMeals
};