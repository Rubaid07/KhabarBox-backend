import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import { mealRouter } from "./modules/meals/meal.routes";
import { reviewRouter } from "./modules/review/review.routes";
import { cartRouter } from "./modules/cart/cart.routes";
import { orderRouter } from "./modules/order/order.routes";
import { providerProfileRoutes } from "./modules/providerProfile/providerProfile.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { categoryRoutes } from "./modules/category/category.routes";
import { providerDashboardRoutes } from "./modules/providerDashboard/providerDashboard.routes";
import { userRouter } from "./modules/user/user.routes";
import { notFound } from "./middleware/notFound";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://khabarbox.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/meals", mealRouter);
app.use("/reviews", reviewRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/provider/profile", providerProfileRoutes);
app.use("/admin", adminRoutes);
app.use("/categories", categoryRoutes);
app.use("/provider/dashboard", providerDashboardRoutes);
app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use(notFound);

export default app;
