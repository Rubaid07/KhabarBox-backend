import { NextFunction, Request, Response } from "express";
import { auth as betterAuth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verify your email.",
        });
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { status: true },
      });

      if (dbUser?.status === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          message: "ACCOUNT_SUSPENDED",
          code: "SUSPENDED",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
      };

      if (roles.length && !roles.includes(req.user.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden Access",
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
