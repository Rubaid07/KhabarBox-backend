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

const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, image, phone, restaurantName, description, address, logoUrl } = req.body;

    await userService.updateMyProfile(user.id, { name, image, phone });

    if (user.role === "PROVIDER") {
      await userService.updateProviderProfile(user.id, {
        restaurantName,
        description,
        address,
        logoUrl,
      });
    }

    const updated = await userService.getMyProfile(user.id);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

export const UserController = {
  getProfile,
  updateProfile,
};