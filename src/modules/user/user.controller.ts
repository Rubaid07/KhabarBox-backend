import { Request, Response } from "express";
import { userService } from "./user.service";

const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const profile = await userService.getMyProfile(user.id);

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { 
      name, 
      image, 
      phone, 
      restaurantName, 
      description,
      address,    
      openingHours,
      logoUrl 
    } = req.body;

    await userService.updateMyProfile(user.id, { name, image, phone });

    if (user.role === "PROVIDER") {
      await userService.updateProviderProfile(user.id, {
        restaurantName,
        description,
        address,
        openingHours,
        logoUrl,
      });
    }

    const updatedProfile = await userService.getMyProfile(user.id);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const initProviderProfile = async (req: Request, res: Response) => {
  try {
    const result = await userService.initProviderProfile(req.body);

    res.status(200).json({
      success: true,
      message: "Provider profile initialized successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to initialize provider profile",
    });
  }
};

export const UserController = {
  getProfile,
  updateProfile,
  initProviderProfile
};