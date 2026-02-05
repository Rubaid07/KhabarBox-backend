import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true
}))

app.use(express.json())

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.send("Hello world");
});

export default app;
