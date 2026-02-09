import { Request, Response } from "express";
import { providerProfileService } from "./providerProfile.service";

const createProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const result = await providerProfileService.createProfile(user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result,
    });
  } catch (e: any) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to create profile",
    });
  }
};

export const ProviderProfileController = {
  createProfile,
};