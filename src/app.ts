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

const app = express();

app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true
}))

app.use(express.json())

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/meals", mealRouter)
app.use("/reviews", reviewRouter)
app.use("/cart", cartRouter)
app.use("/orders", orderRouter)
app.use("/provider/profile", providerProfileRoutes)
app.use("/admin", adminRoutes)

app.get("/", (req, res) => {
  res.send("Hello world");
});

export default app;
