// src/app.ts
import express2 from "express";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role            String?          @default("CUSTOMER")\n  restaurantName  String?          @db.VarChar(225)\n  address         String?          @db.Text\n  phone           String?\n  status          String?          @default("ACTIVE")\n  providerProfile ProviderProfile?\n  meals           Meal[]\n  cartItems       CartItem[]\n  reviews         Review[]\n\n  customerOrders Orders[] @relation("CustomerOrders")\n  providerOrders Orders[] @relation("ProviderOrders")\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel CartItem {\n  id       String @id @default(uuid())\n  quantity Int\n\n  createdAt DateTime @default(now()) @map("created_at")\n  updatedAt DateTime @updatedAt @map("updated_at")\n\n  customerId String @map("customer_id")\n  customer   User   @relation(fields: [customerId], references: [id], onDelete: Cascade)\n\n  mealId String\n  meal   Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)\n\n  @@unique([customerId, mealId])\n  @@index([customerId])\n  @@map("cart_items")\n}\n\nmodel Category {\n  id        String   @id @default(uuid())\n  name      String   @unique\n  createdAt DateTime @default(now()) @map("created_at")\n\n  meals Meal[]\n\n  @@map("categories")\n}\n\nmodel Meal {\n  id          String   @id @default(uuid())\n  name        String\n  description String?  @db.Text\n  price       Decimal  @db.Decimal(10, 2)\n  imageUrl    String?\n  dietaryTags String[] @default([])\n  isAvailable Boolean  @default(true)\n\n  providerId String\n  provider   User   @relation(fields: [providerId], references: [id], onDelete: Cascade)\n\n  categoryId String?\n  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)\n\n  createdAt  DateTime    @default(now())\n  updatedAt  DateTime    @updatedAt\n  orderItems OrderItem[]\n  cartItems  CartItem[]\n  reviews    Review[]\n\n  @@index([providerId, categoryId])\n  @@index([isAvailable])\n  @@map("meals")\n}\n\nmodel OrderItem {\n  id          String  @id @default(uuid())\n  quantity    Int\n  priceAtTime Decimal @db.Decimal(10, 2)\n\n  createdAt DateTime @default(now())\n\n  orderId String\n  order   Orders @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  mealId String\n  meal   Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)\n\n  @@unique([orderId, mealId])\n  @@index([orderId])\n  @@index([mealId])\n  @@map("order_items")\n}\n\nenum OrderStatus {\n  PLACED\n  PREPARING\n  READY\n  DELIVERED\n  CANCELLED\n}\n\nenum PaymentMethod {\n  COD\n  STRIPE\n}\n\nenum PaymentStatus {\n  PENDING\n  COMPLETED\n  FAILED\n  CANCELLED\n}\n\nmodel Orders {\n  id              String        @id @default(uuid())\n  totalAmount     Decimal       @db.Decimal(10, 2)\n  deliveryAddress String\n  phone           String?\n  notes           String?\n  status          OrderStatus   @default(PLACED)\n  paymentMethod   PaymentMethod @default(COD)\n  paymentStatus   PaymentStatus @default(PENDING)\n  stripeSessionId String?\n\n  customerId String\n  customer   User   @relation("CustomerOrders", fields: [customerId], references: [id], onDelete: Cascade)\n\n  providerId String\n  provider   User   @relation("ProviderOrders", fields: [providerId], references: [id], onDelete: Cascade)\n\n  createdAt  DateTime    @default(now())\n  updatedAt  DateTime    @updatedAt\n  orderItems OrderItem[]\n\n  @@index([customerId])\n  @@index([providerId])\n  @@index([status])\n  @@index([paymentStatus])\n  @@index([stripeSessionId])\n  @@index([createdAt])\n  @@map("orders")\n}\n\nmodel ProviderProfile {\n  id             String  @id @default(uuid())\n  restaurantName String  @db.VarChar(225)\n  description    String? @db.Text\n  address        String  @db.Text\n  logoUrl        String?\n  openingHours   String?\n  isVerified     Boolean @default(false)\n\n  userId String @unique\n  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@map("provider_profiles")\n}\n\nmodel Review {\n  id      String  @id @default(uuid())\n  rating  Int     @db.SmallInt\n  comment String? @db.Text\n\n  createdAt DateTime @default(now())\n\n  mealId String\n  meal   Meal   @relation(fields: [mealId], references: [id], onDelete: Cascade)\n\n  customerId String\n  customer   User   @relation(fields: [customerId], references: [id], onDelete: Cascade)\n\n  @@unique([mealId, customerId])\n  @@index([mealId])\n  @@index([customerId])\n  @@index([rating])\n  @@map("reviews")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"scalar","type":"String"},{"name":"restaurantName","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"providerProfile","kind":"object","type":"ProviderProfile","relationName":"ProviderProfileToUser"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToUser"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"customerOrders","kind":"object","type":"Orders","relationName":"CustomerOrders"},{"name":"providerOrders","kind":"object","type":"Orders","relationName":"ProviderOrders"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"CartItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"customerId","kind":"scalar","type":"String","dbName":"customer_id"},{"name":"customer","kind":"object","type":"User","relationName":"CartItemToUser"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"meal","kind":"object","type":"Meal","relationName":"CartItemToMeal"}],"dbName":"cart_items"},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"meals","kind":"object","type":"Meal","relationName":"CategoryToMeal"}],"dbName":"categories"},"Meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Decimal"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"dietaryTags","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"User","relationName":"MealToUser"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToMeal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"MealToOrderItem"},{"name":"cartItems","kind":"object","type":"CartItem","relationName":"CartItemToMeal"},{"name":"reviews","kind":"object","type":"Review","relationName":"MealToReview"}],"dbName":"meals"},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"priceAtTime","kind":"scalar","type":"Decimal"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"order","kind":"object","type":"Orders","relationName":"OrderItemToOrders"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToOrderItem"}],"dbName":"order_items"},"Orders":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"totalAmount","kind":"scalar","type":"Decimal"},{"name":"deliveryAddress","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"paymentMethod","kind":"enum","type":"PaymentMethod"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"CustomerOrders"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"provider","kind":"object","type":"User","relationName":"ProviderOrders"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"OrderItemToOrders"}],"dbName":"orders"},"ProviderProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"restaurantName","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"openingHours","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ProviderProfileToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"provider_profiles"},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"meal","kind":"object","type":"Meal","relationName":"MealToReview"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"customer","kind":"object","type":"User","relationName":"ReviewToUser"}],"dbName":"reviews"}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: true,
    crossSiteCookies: true,
    disableCSRFCheck: true
  },
  cookie: {
    attributes: {
      sameSite: "none",
      secure: true
    }
  },
  trustedOrigins: ["https://khabarbox.vercel.app", "http://localhost:3000"],
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true
      },
      phone: {
        type: "string",
        input: true
      },
      restaurantName: {
        type: "string",
        input: true
      },
      address: {
        type: "string",
        input: true
      }
    }
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === "PROVIDER") {
            await prisma.providerProfile.create({
              data: {
                userId: user.id,
                restaurantName: user.restaurantName || "",
                address: user.address || "",
                description: ""
              }
            });
          }
        }
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"KhabarBox" <khabarbox@gmail.com>',
          to: user.email,
          subject: "Verify Your Email",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - KhabarBox</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .header {
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #feca57 100%);
      padding: 60px 40px;
      text-align: center;
      position: relative;
    }
    
    .header::before {
      content: '\u{1F371}';
      font-size: 80px;
      display: block;
      margin-bottom: 20px;
      animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .brand-name {
      color: #ffffff;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .tagline {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      margin-top: 8px;
      font-weight: 500;
    }
    
    .content {
      padding: 48px 40px;
    }
    
    .name {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 24px;
    }
    
    .message {
      color: #475569;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 32px;
    }
    
    .highlight {
      background: linear-gradient(120deg, #fef3c7 0%, #fef3c7 100%);
      background-repeat: no-repeat;
      background-size: 100% 40%;
      background-position: 0 88%;
      padding: 0 4px;
      font-weight: 600;
      color: #92400e;
    }
    
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 18px 48px;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.5px;
      box-shadow: 0 10px 30px -5px rgba(238, 90, 111, 0.4);
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 20px 40px -5px rgba(238, 90, 111, 0.5);
    }
    
    .security-notice {
      background: #f8fafc;
      border-left: 4px solid #ff6b6b;
      padding: 20px;
      border-radius: 0 12px 12px 0;
      margin: 32px 0;
    }
    
    .security-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .security-text {
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 40px 0;
    }
    
    .manual-url {
      background: #f1f5f9;
      padding: 20px;
      border-radius: 12px;
      word-break: break-all;
    }
    
    .manual-url-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .manual-url-link {
      color: #ff6b6b;
      font-size: 14px;
      text-decoration: none;
      font-weight: 500;
    }
    
    .footer {
      background: #0f172a;
      padding: 40px;
      text-align: center;
      color: #94a3b8;
    }
    
    .social-links {
      margin-bottom: 24px;
    }
    
    .social-icon {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: #1e293b;
      border-radius: 50%;
      margin: 0 8px;
      line-height: 40px;
      text-decoration: none;
      font-size: 18px;
      transition: all 0.3s ease;
    }
    
    .social-icon:hover {
      background: #ff6b6b;
      transform: translateY(-3px);
    }
    
    .footer-brand {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 8px;
    }
    
    .footer-text {
      font-size: 13px;
      line-height: 1.6;
      max-width: 400px;
      margin: 0 auto;
    }
    
    .copyright {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #1e293b;
      font-size: 12px;
      color: #64748b;
    }
    
    @media (max-width: 480px) {
      body { padding: 20px 10px; }
      .header { padding: 40px 24px; }
      .header::before { font-size: 60px; }
      .brand-name { font-size: 28px; }
      .content { padding: 32px 24px; }
      .name { font-size: 24px; }
      .cta-button { padding: 16px 32px; font-size: 15px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="brand-name">KhabarBox</div>
      <div class="tagline">Delicious Food, Delivered Fast</div>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="name">Hey ${user.name || "Foodie"}! \u{1F44B}</div>
      
      <p class="message">
        Thanks for joining <span class="highlight">KhabarBox</span> \u2014 your favorite food delivery partner! 
        We're thrilled to have you on board. To start exploring delicious meals from top restaurants, 
        please verify your email address by clicking the button below.
      </p>
      
      <!-- CTA Button -->
      <div class="cta-container">
        <a href="${verificationUrl}" class="cta-button">
          Verify My Email
        </a>
      </div>
      
      <!-- Security Notice -->
      <div class="security-notice">
        <div class="security-title">
          Security Notice
        </div>
        <div class="security-text">
          This verification link expires in <strong>24 hours</strong> for your security. 
          If you didn't create this account, you can safely ignore this email \u2014 no action needed.
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Manual URL -->
      <div class="manual-url">
        <div class="manual-url-label">Button not working?</div>
        <a href="${verificationUrl}" class="manual-url-link">${verificationUrl}</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">\u{1F371} KhabarBox</div>
      <p class="footer-text">
        Connecting food lovers with the best local restaurants. 
        Fresh, fast, and always delicious.
      </p>
      <div class="copyright">
        \xA9 2025 KhabarBox. All rights reserved.<br>
        Made with \u2764\uFE0F in Bangladesh
      </div>
    </div>
  </div>
</body>
</html>`
        });
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: "https://khabarbox.vercel.app/api/auth/callback/google"
    }
  },
  onPath: {
    redirect: "https://khabarbox.vercel.app"
  }
});

// src/app.ts
import cors from "cors";

// src/modules/meals/meal.routes.ts
import express from "express";

// src/modules/meals/meal.service.ts
var createMela = async (data, userId) => {
  const result = await prisma.meal.create({
    data: {
      ...data,
      providerId: userId
    }
  });
  return result;
};
var getAllMeal = async (filters) => {
  const {
    search,
    dietaryTags,
    isAvailable,
    priceRange,
    providerId,
    categoryId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  } = filters;
  const andConditions = [];
  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { dietaryTags: { has: search } },
        // ✅ Search by restaurant name through provider -> providerProfile
        {
          provider: {
            providerProfile: {
              restaurantName: { contains: search, mode: "insensitive" }
            }
          }
        }
      ]
    });
  }
  if (categoryId) {
    andConditions.push({ categoryId });
  }
  if (dietaryTags && dietaryTags.length > 0) {
    andConditions.push({
      dietaryTags: { hasEvery: dietaryTags }
    });
  }
  if (typeof isAvailable === "boolean") {
    andConditions.push({ isAvailable });
  }
  if (priceRange) {
    const priceCondition = {};
    if (priceRange.min !== void 0)
      priceCondition.gte = Number(priceRange.min);
    if (priceRange.max !== void 0)
      priceCondition.lte = Number(priceRange.max);
    if (Object.keys(priceCondition).length > 0) {
      andConditions.push({ price: priceCondition });
    }
  }
  if (providerId) {
    andConditions.push({ providerId });
  }
  const meal = await prisma.meal.findMany({
    where: {
      AND: andConditions
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder
    },
    include: {
      category: true,
      provider: {
        include: {
          providerProfile: {
            select: { restaurantName: true, logoUrl: true }
          }
        }
      }
    }
  });
  const total = await prisma.meal.count({
    where: {
      AND: andConditions
    }
  });
  return {
    data: meal,
    metaData: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getMealById = async (id) => {
  const meal = await prisma.meal.findUnique({
    where: { id },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          providerProfile: true
        }
      },
      category: true,
      reviews: {
        include: {
          customer: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      _count: { select: { reviews: true } }
    }
  });
  if (!meal) return null;
  const totalRating = meal.reviews.reduce((sum, rev) => sum + rev.rating, 0);
  const averageRating = meal.reviews.length > 0 ? Number((totalRating / meal.reviews.length).toFixed(1)) : 0;
  return {
    ...meal,
    averageRating,
    totalReviews: meal.reviews.length
  };
};
var updateMeal = async (id, data) => {
  return prisma.meal.update({
    where: { id },
    data,
    include: {
      category: true
    }
  });
};
var deleteMeal = async (id) => {
  return await prisma.$transaction(async (tx) => {
    return tx.meal.delete({ where: { id } });
  });
};
var getSuggestions = async (query) => {
  if (!query || query.length < 2) {
    return { meals: [], tags: [], restaurants: [] };
  }
  const searchLower = query.toLowerCase();
  const [meals, allMealsForTags, restaurants, categories] = await Promise.all([
    prisma.meal.findMany({
      where: {
        isAvailable: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { dietaryTags: { hasSome: [query] } },
          {
            provider: {
              providerProfile: {
                restaurantName: { contains: query, mode: "insensitive" }
              }
            }
          }
        ]
      },
      include: {
        provider: {
          include: {
            providerProfile: {
              select: { restaurantName: true }
            }
          }
        }
      },
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    prisma.meal.findMany({
      where: { isAvailable: true },
      select: { dietaryTags: true },
      take: 100
    }),
    prisma.user.findMany({
      where: {
        role: "PROVIDER",
        providerProfile: {
          OR: [
            { restaurantName: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        }
      },
      include: {
        providerProfile: {
          select: { restaurantName: true, logoUrl: true }
        }
      },
      take: 3
    }),
    prisma.category.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      select: { id: true, name: true },
      take: 3
    })
  ]);
  const tagSet = /* @__PURE__ */ new Set();
  allMealsForTags.forEach((meal) => {
    meal.dietaryTags?.forEach((tag) => {
      if (tag.toLowerCase().includes(searchLower)) {
        tagSet.add(tag);
      }
    });
  });
  return {
    meals: meals.map((m) => ({
      id: m.id,
      name: m.name,
      imageUrl: m.imageUrl ?? void 0,
      restaurantName: m.provider?.providerProfile?.restaurantName ?? void 0,
      price: Number(m.price)
    })),
    tags: Array.from(tagSet).slice(0, 8),
    restaurants: restaurants.map((r) => ({
      id: r.id,
      name: r.providerProfile?.restaurantName ?? "Unknown",
      logoUrl: r.providerProfile?.logoUrl ?? void 0
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name
    }))
  };
};
var mealService = {
  createMela,
  getAllMeal,
  getMealById,
  updateMeal,
  deleteMeal,
  getSuggestions
};

// src/helpers/paginationSortingHelper.ts
var paginationSortingHelper = (options) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";
  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder
  };
};
var paginationSortingHelper_default = paginationSortingHelper;

// src/modules/meals/meal.controller.ts
var createMeal = async (req, res) => {
  const user = req.user;
  try {
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized!"
      });
    }
    const result = await mealService.createMela(req.body, user.id);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Meal creation failed",
      details: e
    });
  }
};
var getAllMeal2 = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, categoryId } = req.query;
    const searchString = typeof search === "string" ? search : void 0;
    const categoryIdString = typeof categoryId === "string" ? categoryId : void 0;
    const dietaryTags = req.query.dietaryTags ? req.query.dietaryTags.split(",") : [];
    const isAvailable = req.query.isAvailable === "true" ? true : req.query.isAvailable === "false" ? false : void 0;
    const priceRange = typeof minPrice === "string" || typeof maxPrice === "string" ? {
      ...typeof minPrice === "string" && { min: Number(minPrice) },
      ...typeof maxPrice === "string" && { max: Number(maxPrice) }
    } : void 0;
    const providerId = typeof req.query.providerId === "string" ? req.query.providerId : void 0;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(
      req.query
    );
    const filters = {
      ...searchString && { search: searchString },
      ...categoryIdString && { categoryId: categoryIdString },
      ...dietaryTags.length > 0 && { dietaryTags },
      ...typeof isAvailable === "boolean" && { isAvailable },
      ...priceRange && { priceRange },
      ...providerId && { providerId },
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    };
    const result = await mealService.getAllMeal(filters);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch meal",
      details: e
    });
  }
};
var getSuggestions2 = async (req, res) => {
  try {
    const { query } = req.query;
    const searchString = typeof query === "string" ? query : "";
    const result = await mealService.getSuggestions(searchString);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch suggestions",
      details: e
    });
  }
};
var getMealById2 = async (req, res) => {
  try {
    const { mealId } = req.params;
    if (!mealId) {
      throw new Error("Meal id not found");
    }
    const result = await mealService.getMealById(mealId);
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch meal",
      details: e
    });
  }
};
var updateMeal2 = async (req, res) => {
  try {
    const { mealId } = req.params;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const existingMeal = await mealService.getMealById(mealId);
    if (!existingMeal) {
      return res.status(404).json({ success: false, error: "Meal not found" });
    }
    const isOwner = existingMeal.providerId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: "Not your meal" });
    }
    const result = await mealService.updateMeal(mealId, req.body);
    res.status(200).json({
      success: true,
      message: "Meal updated successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      error: "Update failed",
      details: e
    });
  }
};
var deleteMeal2 = async (req, res) => {
  try {
    const { mealId } = req.params;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const existingMeal = await mealService.getMealById(mealId);
    if (!existingMeal) {
      return res.status(404).json({ success: false, error: "Meal not found" });
    }
    const isOwner = existingMeal.providerId === user.id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: "You don't have permission to delete this meal" });
    }
    await mealService.deleteMeal(mealId);
    res.status(200).json({
      success: true,
      message: "Meal deleted successfully"
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      error: e.message || "Delete failed"
    });
  }
};
var MealController = {
  createMeal,
  getAllMeal: getAllMeal2,
  getSuggestions: getSuggestions2,
  getMealById: getMealById2,
  updateMeal: updateMeal2,
  deleteMeal: deleteMeal2
};

// src/middleware/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required. Please verify your email."
        });
      }
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { status: true }
      });
      if (dbUser?.status === "SUSPENDED") {
        return res.status(403).json({
          success: false,
          message: "ACCOUNT_SUSPENDED",
          code: "SUSPENDED"
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden Access"
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
var auth_default = auth2;

// src/modules/meals/meal.routes.ts
var router = express.Router();
router.get(
  "/",
  MealController.getAllMeal
);
router.get("/suggestions", MealController.getSuggestions);
router.get(
  "/:mealId",
  MealController.getMealById
);
router.post(
  "/",
  auth_default("PROVIDER" /* PROVIDER */),
  MealController.createMeal
);
router.patch(
  "/:mealId",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  MealController.updateMeal
);
router.delete(
  "/:mealId",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  MealController.deleteMeal
);
var mealRouter = router;

// src/modules/review/review.routes.ts
import { Router } from "express";

// src/modules/review/review.service.ts
var createReview = async (data) => {
  const { mealId, customerId, rating, comment } = data;
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  const existingReview = await prisma.review.findUnique({
    where: {
      mealId_customerId: {
        mealId,
        customerId
      }
    }
  });
  if (existingReview) {
    throw new Error("You have already reviewed this meal");
  }
  const deliveredOrder = await prisma.orders.findFirst({
    where: {
      customerId,
      orderItems: {
        some: {
          mealId
        }
      },
      status: "DELIVERED"
    }
  });
  if (!deliveredOrder) {
    throw new Error("You can only review meals from delivered orders");
  }
  const review = await prisma.review.create({
    data: {
      mealId,
      customerId,
      rating,
      comment: comment ?? null
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      meal: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });
  return review;
};
var getReviews = async (mealId) => {
  const reviews = await prisma.review.findMany({
    where: { mealId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  const avgRating = await prisma.review.aggregate({
    where: { mealId },
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    }
  });
  return {
    reviews,
    meta: {
      total: avgRating._count.rating,
      averageRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0
    }
  };
};
var getMyReviews = async (customerId) => {
  return prisma.review.findMany({
    where: { customerId },
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          provider: {
            select: {
              providerProfile: {
                select: {
                  restaurantName: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};
var updateReview = async (reviewId, customerId, data) => {
  const existingReview = await prisma.review.findFirst({
    where: {
      id: reviewId,
      customerId
    }
  });
  if (!existingReview) {
    throw new Error("Review not found or not authorized");
  }
  if (data.rating !== void 0 && (data.rating < 1 || data.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...data.rating !== void 0 && { rating: data.rating },
      ...data.comment !== void 0 && { comment: data.comment }
    },
    include: {
      customer: { select: { id: true, name: true, image: true } },
      meal: { select: { id: true, name: true } }
    }
  });
};
var deleteReview = async (reviewId, userId, userRole) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new Error("Review not found");
  }
  const isOwner = review.customerId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new Error("Not authorized to delete this review");
  }
  return prisma.review.delete({
    where: { id: reviewId }
  });
};
var reviewService = {
  createReview,
  getReviews,
  getMyReviews,
  updateReview,
  deleteReview
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const result = await reviewService.createReview({
      ...req.body,
      customerId: user.id
    });
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      error: e.message || "Failed to add review"
    });
  }
};
var getReviews2 = async (req, res) => {
  try {
    const { mealId } = req.params;
    const result = await reviewService.getReviews(mealId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews"
    });
  }
};
var getMyReviews2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const result = await reviewService.getMyReviews(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch reviews"
    });
  }
};
var updateReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const result = await reviewService.updateReview(reviewId, user.id, {
      rating,
      comment
    });
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: result
    });
  } catch (e) {
    res.status(403).json({
      success: false,
      message: e.message || "Failed to update review"
    });
  }
};
var deleteReview2 = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { reviewId } = req.params;
    await reviewService.deleteReview(reviewId, user.id, user.role);
    res.status(200).json({
      success: false,
      message: "Review deleted successfully"
    });
  } catch (e) {
    res.status(403).json({
      success: false,
      message: e.message || "Failed to delete review"
    });
  }
};
var ReviewController = {
  createReview: createReview2,
  getReviews: getReviews2,
  getMyReviews: getMyReviews2,
  updateReview: updateReview2,
  deleteReview: deleteReview2
};

// src/modules/review/review.routes.ts
var router2 = Router();
router2.get(
  "/meals/:mealId",
  ReviewController.getReviews
);
router2.get(
  "/my",
  ReviewController.getMyReviews
);
router2.post(
  "/",
  auth_default("CUSTOMER" /* CUSTOMER */),
  ReviewController.createReview
);
router2.patch(
  "/:reviewId",
  auth_default("CUSTOMER" /* CUSTOMER */, "ADMIN" /* ADMIN */),
  ReviewController.updateReview
);
router2.delete(
  "/:reviewId",
  auth_default("CUSTOMER" /* CUSTOMER */, "ADMIN" /* ADMIN */),
  ReviewController.deleteReview
);
var reviewRouter = router2;

// src/modules/cart/cart.routes.ts
import { Router as Router2 } from "express";

// src/modules/cart/cart.service.ts
var addToCart = async (customerId, data) => {
  const { mealId, quantity } = data;
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }
  const meal = await prisma.meal.findUnique({
    where: {
      id: mealId,
      isAvailable: true
    }
  });
  if (!meal) {
    throw new Error("Meal not available");
  }
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      customerId_mealId: { customerId, mealId }
    }
  });
  if (existingItem) {
    return prisma.cartItem.update({
      where: {
        id: existingItem.id
      },
      data: {
        quantity: existingItem.quantity + quantity
      },
      include: { meal: true }
    });
  }
  return prisma.cartItem.create({
    data: {
      customerId,
      mealId,
      quantity
    },
    include: { meal: true }
  });
};
var getMyCart = async (customerId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: {
      meal: {
        include: {
          provider: {
            select: {
              providerProfile: {
                select: { restaurantName: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.meal.price) * item.quantity,
    0
  );
  return {
    items: cartItems,
    meta: {
      totalItems,
      totalAmount: Number(totalAmount.toFixed(2))
    }
  };
};
var updateQuantity = async (cartItemId, customerId, quantity) => {
  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, customerId }
  });
  if (!cartItem) {
    throw new Error("Cart item not found");
  }
  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { meal: true }
  });
};
var removeItem = async (cartItemId, customerId) => {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, customerId }
  });
  if (!cartItem) {
    throw new Error("Cart item not found");
  }
  return prisma.cartItem.delete({
    where: { id: cartItemId }
  });
};
var clearCart = async (customerId) => {
  return prisma.cartItem.deleteMany({
    where: { customerId }
  });
};
var cartService = {
  addToCart,
  getMyCart,
  updateQuantity,
  removeItem,
  clearCart
};

// src/modules/cart/cart.controller.ts
var addToCart2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await cartService.addToCart(user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Added to cart",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to add to cart"
    });
  }
};
var getMyCart2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await cartService.getMyCart(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message || "Failed to fetch cart"
    });
  }
};
var updateQuantity2 = async (req, res) => {
  try {
    const user = req.user;
    const { cartId } = req.params;
    const { quantity } = req.body;
    const result = await cartService.updateQuantity(cartId, user.id, quantity);
    res.status(200).json({
      success: true,
      message: "Quantity updated",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to update"
    });
  }
};
var removeItem2 = async (req, res) => {
  try {
    const user = req.user;
    const { cartId } = req.params;
    await cartService.removeItem(cartId, user.id);
    res.status(200).json({
      success: true,
      message: "Item removed from cart"
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to remove"
    });
  }
};
var clearCart2 = async (req, res) => {
  try {
    const user = req.user;
    await cartService.clearCart(user.id);
    res.status(200).json({
      success: true,
      message: "Cart cleared"
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message || "Failed to clear cart"
    });
  }
};
var CartController = {
  addToCart: addToCart2,
  getMyCart: getMyCart2,
  updateQuantity: updateQuantity2,
  removeItem: removeItem2,
  clearCart: clearCart2
};

// src/modules/cart/cart.routes.ts
var router3 = Router2();
router3.get(
  "/",
  auth_default("CUSTOMER" /* CUSTOMER */),
  CartController.getMyCart
);
router3.post(
  "/",
  auth_default("CUSTOMER" /* CUSTOMER */),
  CartController.addToCart
);
router3.patch(
  "/:cartId",
  auth_default("CUSTOMER" /* CUSTOMER */),
  CartController.updateQuantity
);
router3.delete(
  "/:cartId",
  auth_default("CUSTOMER" /* CUSTOMER */),
  CartController.removeItem
);
router3.delete(
  "/",
  auth_default("CUSTOMER" /* CUSTOMER */),
  CartController.clearCart
);
var cartRouter = router3;

// src/modules/order/order.routes.ts
import { Router as Router3 } from "express";

// src/modules/order/order.service.ts
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20"
});
var placeOrder = async (customerId, data) => {
  const { deliveryAddress, phone, notes, paymentMethod = "COD" } = data;
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true }
  });
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }
  const itemsByProvider = cartItems.reduce(
    (acc, item) => {
      const providerId = item.meal.providerId;
      if (!acc[providerId]) acc[providerId] = [];
      acc[providerId].push(item);
      return acc;
    },
    {}
  );
  const orders = [];
  for (const [providerId, items] of Object.entries(itemsByProvider)) {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0
    );
    const order = await prisma.orders.create({
      data: {
        customerId,
        providerId,
        totalAmount,
        deliveryAddress,
        phone: phone ? String(phone) : "",
        notes: notes || "",
        status: paymentMethod === "STRIPE" ? "PLACED" : "PLACED",
        paymentMethod,
        paymentStatus: paymentMethod === "STRIPE" ? "PENDING" : "COMPLETED",
        orderItems: {
          create: items.map((item) => ({
            mealId: item.mealId,
            quantity: item.quantity,
            priceAtTime: item.meal.price
          }))
        }
      },
      include: {
        orderItems: { include: { meal: true } },
        provider: {
          select: {
            providerProfile: { select: { restaurantName: true } }
          }
        }
      }
    });
    orders.push(order);
  }
  await prisma.cartItem.deleteMany({ where: { customerId } });
  return orders;
};
var createStripeCheckoutSession = async (customerId, data) => {
  const { deliveryAddress, phone, notes } = data;
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true }
  });
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }
  const customer = await prisma.user.findUnique({
    where: { id: customerId }
  });
  if (!customer) {
    throw new Error("Customer not found");
  }
  const itemsByProvider = cartItems.reduce(
    (acc, item) => {
      const providerId = item.meal.providerId;
      if (!acc[providerId]) acc[providerId] = [];
      acc[providerId].push(item);
      return acc;
    },
    {}
  );
  const totalAmountCents = Math.round(
    cartItems.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0
    ) * 100
  );
  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "bdt",
      product_data: {
        name: item.meal.name,
        images: item.meal.imageUrl ? [item.meal.imageUrl] : []
      },
      unit_amount: Math.round(Number(item.meal.price) * 100)
    },
    quantity: item.quantity
  }));
  const frontendUrl = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer_email: customer.email,
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/checkout/cancel`,
    metadata: {
      customerId,
      deliveryAddress: deliveryAddress.substring(0, 500),
      phone: phone || "",
      notes: notes || ""
    }
  });
  return {
    sessionId: session.id,
    url: session.url
  };
};
var verifyStripePayment = async (sessionId, customerId, metadata) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }
  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }
  const { deliveryAddress, phone, notes } = metadata;
  const cartItems = await prisma.cartItem.findMany({
    where: { customerId },
    include: { meal: true }
  });
  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }
  const itemsByProvider = cartItems.reduce(
    (acc, item) => {
      const providerId = item.meal.providerId;
      if (!acc[providerId]) acc[providerId] = [];
      acc[providerId].push(item);
      return acc;
    },
    {}
  );
  const orders = [];
  for (const [providerId, items] of Object.entries(itemsByProvider)) {
    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.meal.price) * item.quantity,
      0
    );
    const order = await prisma.orders.create({
      data: {
        customerId,
        providerId,
        totalAmount,
        deliveryAddress,
        phone: phone ? String(phone) : "",
        notes: notes || "",
        status: "PLACED",
        paymentMethod: "STRIPE",
        paymentStatus: "COMPLETED",
        stripeSessionId: sessionId,
        orderItems: {
          create: items.map((item) => ({
            mealId: item.mealId,
            quantity: item.quantity,
            priceAtTime: item.meal.price
          }))
        }
      },
      include: {
        orderItems: { include: { meal: true } },
        provider: {
          select: {
            providerProfile: { select: { restaurantName: true } }
          }
        }
      }
    });
    orders.push(order);
  }
  await prisma.cartItem.deleteMany({ where: { customerId } });
  return orders;
};
var getMyOrders = async (customerId) => {
  return prisma.orders.findMany({
    where: { customerId },
    include: {
      orderItems: {
        include: {
          meal: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      },
      provider: {
        include: {
          providerProfile: {
            select: {
              restaurantName: true,
              address: true,
              logoUrl: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getProviderOrders = async (providerId) => {
  return prisma.orders.findMany({
    where: { providerId },
    include: {
      orderItems: {
        include: { meal: { select: { name: true, imageUrl: true } } }
      },
      customer: { select: { name: true, phone: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var getOrderById = async (orderId, userId, userRole) => {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { meal: true } },
      customer: { select: { id: true, name: true, phone: true } },
      provider: {
        select: {
          id: true,
          providerProfile: { select: { restaurantName: true, address: true } }
        }
      }
    }
  });
  if (!order) throw new Error("Order not found");
  const isOwner = order.customerId === userId || order.providerId === userId;
  const isAdmin = userRole === "ADMIN" /* ADMIN */;
  if (!isOwner && !isAdmin) {
    throw new Error("Not authorized");
  }
  return order;
};
var updateStatus = async (orderId, providerId, newStatus) => {
  const order = await prisma.orders.findFirst({
    where: { id: orderId, providerId }
  });
  if (!order) throw new Error("Order not found");
  const transitions = {
    PLACED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: []
  };
  const allowed = transitions[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot change from ${order.status} to ${newStatus}`);
  }
  return prisma.orders.update({
    where: { id: orderId },
    data: { status: newStatus }
  });
};
var cancelOrder = async (orderId, customerId) => {
  const order = await prisma.orders.findFirst({
    where: { id: orderId, customerId }
  });
  if (!order) throw new Error("Order not found");
  if (!["PLACED", "PREPARING"].includes(order.status)) {
    throw new Error("Cannot cancel this order");
  }
  return prisma.orders.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  });
};
var orderService = {
  placeOrder,
  createStripeCheckoutSession,
  verifyStripePayment,
  getMyOrders,
  getProviderOrders,
  getOrderById,
  updateStatus,
  cancelOrder
};

// src/modules/order/order.controller.ts
var placeOrder2 = async (req, res) => {
  try {
    const user = req.user;
    const { deliveryAddress, phone, notes, paymentMethod } = req.body;
    const result = await orderService.placeOrder(user.id, {
      deliveryAddress,
      phone,
      notes,
      paymentMethod: paymentMethod || "COD"
    });
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to place order"
    });
  }
};
var createStripeCheckoutSession2 = async (req, res) => {
  try {
    const user = req.user;
    const { deliveryAddress, phone, notes } = req.body;
    const sessionData = await orderService.createStripeCheckoutSession(
      user.id,
      {
        deliveryAddress,
        phone,
        notes
      }
    );
    res.status(200).json({
      success: true,
      data: sessionData
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to create checkout session"
    });
  }
};
var verifyStripePayment2 = async (req, res) => {
  try {
    const user = req.user;
    const { sessionId } = req.params;
    const { deliveryAddress, phone, notes } = req.body;
    const orders = await orderService.verifyStripePayment(sessionId, user.id, {
      deliveryAddress,
      phone,
      notes
    });
    res.status(200).json({
      success: true,
      message: "Payment verified and orders created",
      data: orders
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to verify payment"
    });
  }
};
var getMyOrders2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await orderService.getMyOrders(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getProviderOrders2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await orderService.getProviderOrders(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getOrderById2 = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const result = await orderService.getOrderById(
      id,
      user.id,
      user.role
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(403).json({
      success: false,
      message: e.message
    });
  }
};
var updateStatus2 = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;
    const result = await orderService.updateStatus(
      id,
      user.id,
      status
    );
    res.status(200).json({
      success: true,
      message: "Status updated",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var cancelOrder2 = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const result = await orderService.cancelOrder(id, user.id);
    res.status(200).json({
      success: true,
      message: "Order cancelled",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var OrderController = {
  placeOrder: placeOrder2,
  createStripeCheckoutSession: createStripeCheckoutSession2,
  verifyStripePayment: verifyStripePayment2,
  getMyOrders: getMyOrders2,
  getProviderOrders: getProviderOrders2,
  getOrderById: getOrderById2,
  updateStatus: updateStatus2,
  cancelOrder: cancelOrder2
};

// src/modules/order/order.routes.ts
var router4 = Router3();
router4.post("/", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.placeOrder);
router4.post(
  "/stripe/checkout",
  auth_default("CUSTOMER" /* CUSTOMER */),
  OrderController.createStripeCheckoutSession
);
router4.post(
  "/stripe/verify/:sessionId",
  auth_default("CUSTOMER" /* CUSTOMER */),
  OrderController.verifyStripePayment
);
router4.get("/my", auth_default("CUSTOMER" /* CUSTOMER */), OrderController.getMyOrders);
router4.get(
  "/provider",
  auth_default("PROVIDER" /* PROVIDER */),
  OrderController.getProviderOrders
);
router4.get("/:id", auth_default(), OrderController.getOrderById);
router4.patch(
  "/:id/status",
  auth_default("PROVIDER" /* PROVIDER */),
  OrderController.updateStatus
);
router4.patch(
  "/:id/cancel",
  auth_default("CUSTOMER" /* CUSTOMER */),
  OrderController.cancelOrder
);
var orderRouter = router4;

// src/modules/providerProfile/providerProfile.routes.ts
import { Router as Router4 } from "express";

// src/modules/providerProfile/providerProfile.service.ts
var createProfile = async (userId, data) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (existing) {
    throw new Error("Profile already exists. Use update instead.");
  }
  return prisma.providerProfile.create({
    data: {
      ...data,
      userId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true
        }
      }
    }
  });
};
var getMyProfile = async (userId) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true
        }
      }
    }
  });
  if (!profile) {
    throw new Error("Profile not found. Please create one.");
  }
  return profile;
};
var updateProfile = async (userId, data) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    throw new Error("Profile not found. Create one first.");
  }
  return prisma.providerProfile.update({
    where: { userId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true
        }
      }
    }
  });
};
var getPublicProfile = async (userId) => {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          meals: {
            include: {
              reviews: true
            }
          },
          _count: {
            select: { meals: true }
          }
        }
      }
    }
  });
  if (!profile) throw new Error("Provider profile not found");
  const allReviews = profile.user.meals.flatMap((meal) => meal.reviews || []);
  const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
  const averageRating = allReviews.length > 0 ? Number((totalRating / allReviews.length).toFixed(1)) : 0;
  return {
    ...profile,
    averageRating,
    totalReviews: allReviews.length
  };
};
var getAllProfiles = async () => {
  const profiles = await prisma.providerProfile.findMany({
    take: 8,
    include: {
      user: {
        select: {
          image: true,
          name: true,
          _count: {
            select: { meals: true }
          }
        }
      }
    }
  });
  const userIds = profiles.map((p) => p.userId);
  const ratingsData = await prisma.review.groupBy({
    by: ["mealId"],
    _avg: {
      rating: true
    },
    _count: {
      rating: true
    },
    where: {
      meal: {
        providerId: {
          in: userIds
        }
      }
    }
  });
  const meals = await prisma.meal.findMany({
    where: {
      providerId: {
        in: userIds
      }
    },
    select: {
      id: true,
      providerId: true
    }
  });
  const providerStats = /* @__PURE__ */ new Map();
  ratingsData.forEach((r) => {
    const meal = meals.find((m) => m.id === r.mealId);
    if (meal) {
      const current = providerStats.get(meal.providerId) || { total: 0, count: 0, sum: 0 };
      current.count += r._count.rating;
      current.sum += (r._avg.rating || 0) * r._count.rating;
      providerStats.set(meal.providerId, current);
    }
  });
  return profiles.map((profile) => {
    const stats = providerStats.get(profile.userId);
    const averageRating = stats ? Number((stats.sum / stats.count).toFixed(1)) : 0;
    const totalReviews = stats ? stats.count : 0;
    return {
      id: profile.id,
      userId: profile.userId,
      restaurantName: profile.restaurantName,
      description: profile.description,
      address: profile.address,
      logoUrl: profile.logoUrl,
      isVerified: true,
      averageRating,
      totalReviews,
      user: {
        name: profile.user.name,
        image: profile.user.image,
        _count: profile.user._count
      }
    };
  });
};
var getTopRatedRestaurants = async () => {
  const profiles = await prisma.providerProfile.findMany({
    include: {
      user: {
        include: {
          _count: {
            select: {
              meals: {
                where: { isAvailable: true }
              }
            }
          },
          meals: {
            include: {
              reviews: true
            }
          }
        }
      }
    }
  });
  const result = profiles.map((profile) => {
    const allReviews = profile.user.meals?.flatMap((meal) => meal.reviews || []) || [];
    const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const averageRating = allReviews.length > 0 ? Number((totalRating / allReviews.length).toFixed(1)) : 0;
    return {
      id: profile.id,
      userId: profile.userId,
      restaurantName: profile.restaurantName,
      description: profile.description,
      address: profile.address,
      logoUrl: profile.logoUrl,
      averageRating,
      totalReviews: allReviews.length,
      user: {
        name: profile.user.name,
        image: profile.user.image,
        _count: profile.user._count
      }
    };
  });
  return result.sort((a, b) => b.averageRating - a.averageRating).slice(0, 10);
};
var providerProfileService = {
  createProfile,
  getMyProfile,
  updateProfile,
  getPublicProfile,
  getAllProfiles,
  getTopRatedRestaurants
};

// src/modules/providerProfile/providerProfile.controller.ts
var createProfile2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await providerProfileService.createProfile(user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to create profile"
    });
  }
};
var getMyProfile2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await providerProfileService.getMyProfile(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(404).json({
      success: false,
      message: e.message || "Profile not found"
    });
  }
};
var updateProfile2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await providerProfileService.updateProfile(user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to update profile"
    });
  }
};
var getPublicProfile2 = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await providerProfileService.getPublicProfile(userId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(404).json({
      success: false,
      message: e.message || "Profile not found"
    });
  }
};
var getAllProfiles2 = async (req, res) => {
  try {
    const result = await providerProfileService.getAllProfiles();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message || "Failed to fetch restaurants"
    });
  }
};
var getTopRatedRestaurants2 = async (req, res) => {
  try {
    const result = await providerProfileService.getTopRatedRestaurants();
    res.status(200).json({
      success: true,
      message: "Top rated restaurants fetched successfully",
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message || "Failed to fetch top rated restaurants"
    });
  }
};
var ProviderProfileController = {
  createProfile: createProfile2,
  getMyProfile: getMyProfile2,
  updateProfile: updateProfile2,
  getPublicProfile: getPublicProfile2,
  getAllProfiles: getAllProfiles2,
  getTopRatedRestaurants: getTopRatedRestaurants2
};

// src/modules/providerProfile/providerProfile.routes.ts
var router5 = Router4();
router5.get(
  "/top-rated",
  ProviderProfileController.getTopRatedRestaurants
);
router5.get(
  "/",
  ProviderProfileController.getAllProfiles
);
router5.get(
  "/:userId",
  ProviderProfileController.getPublicProfile
);
router5.get(
  "/me",
  auth_default("PROVIDER" /* PROVIDER */),
  ProviderProfileController.getMyProfile
);
router5.post(
  "/",
  auth_default("PROVIDER" /* PROVIDER */),
  ProviderProfileController.createProfile
);
router5.patch(
  "/me",
  auth_default("PROVIDER" /* PROVIDER */),
  ProviderProfileController.updateProfile
);
var providerProfileRoutes = router5;

// src/modules/admin/admin.routes.ts
import { Router as Router5 } from "express";

// src/modules/admin/admin.service.ts
var getDashboardStats = async () => {
  const [
    totalUsers,
    totalProviders,
    totalCustomers,
    totalOrders,
    totalRevenueAgg,
    pendingOrders
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.orders.count(),
    prisma.orders.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true }
    }),
    prisma.orders.count({
      where: { status: { in: ["PLACED", "PREPARING"] } }
    })
  ]);
  return {
    users: {
      total: totalUsers,
      providers: totalProviders,
      customers: totalCustomers
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders
    },
    revenue: Number(totalRevenueAgg._sum.totalAmount) || 0
  };
};
var getAllUsers = async (options) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(options);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        providerProfile: {
          select: {
            restaurantName: true,
            address: true,
            logoUrl: true,
            isVerified: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.user.count()
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: users
  };
};
var getAllOrders = async (options) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper_default(options);
  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      include: {
        customer: {
          select: { name: true, email: true }
        },
        provider: {
          include: {
            providerProfile: {
              select: { restaurantName: true }
            }
          }
        },
        orderItems: {
          include: {
            meal: { select: { name: true } }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    }),
    prisma.orders.count()
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: orders
  };
};
var suspendUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error("User not found");
  if (user.role === "ADMIN") throw new Error("Cannot suspend admin");
  return prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" }
  });
};
var activateUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) throw new Error("User not found");
  return prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" }
  });
};
var deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerOrders: {
        where: { NOT: { status: { in: ["DELIVERED", "CANCELLED"] } } }
      },
      customerOrders: {
        where: { NOT: { status: { in: ["DELIVERED", "CANCELLED"] } } }
      }
    }
  });
  if (!user) throw new Error("User not found");
  if (user.role?.toUpperCase() === "ADMIN") {
    throw new Error("Security Alert: Cannot delete an ADMIN account.");
  }
  const hasPendingOrders = user.providerOrders.length > 0 || user.customerOrders.length > 0;
  if (hasPendingOrders) {
    throw new Error("Cannot delete user: Active orders are still in progress.");
  }
  return await prisma.$transaction(async (tx) => {
    if (user.role?.toUpperCase() === "PROVIDER") {
      await tx.meal.deleteMany({ where: { providerId: userId } });
      await tx.providerProfile.deleteMany({ where: { userId } });
    }
    await tx.cartItem.deleteMany({ where: { customerId: userId } });
    await tx.review.deleteMany({ where: { customerId: userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    return tx.user.delete({ where: { id: userId } });
  });
};
var updateOrderStatus = async (orderId, status) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  const validStatuses = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status");
  }
  return prisma.orders.update({
    where: { id: orderId },
    data: { status }
  });
};
var cancelOrder3 = async (orderId) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");
  if (order.status === "DELIVERED" || order.status === "CANCELLED") {
    throw new Error("Cannot cancel this order");
  }
  return prisma.orders.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  });
};
var getRevenueTrend = async (days = 30) => {
  const startDate = /* @__PURE__ */ new Date();
  startDate.setDate(startDate.getDate() - days);
  const orders = await prisma.orders.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: "CANCELLED" }
    },
    select: {
      createdAt: true,
      totalAmount: true
    },
    orderBy: { createdAt: "asc" }
  });
  const grouped = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!date) return acc;
    const amount = Number(order.totalAmount) || 0;
    if (!acc[date]) {
      acc[date] = { revenue: 0, count: 0 };
    }
    acc[date].revenue += amount;
    acc[date].count += 1;
    return acc;
  }, {});
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayData = grouped[dateStr] || { revenue: 0, count: 0 };
    result.push({
      date: dateStr,
      revenue: dayData.revenue,
      orders: dayData.count
    });
  }
  return result;
};
var getRecentOrders = async (limit = 10) => {
  const orders = await prisma.orders.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { name: true, email: true }
      },
      provider: {
        include: {
          providerProfile: {
            select: { restaurantName: true }
          }
        }
      }
    }
  });
  return orders.map((order) => ({
    ...order,
    totalAmount: Number(order.totalAmount) || 0
  }));
};
var getTopProviders = async (limit = 5) => {
  const providers = await prisma.orders.groupBy({
    by: ["providerId"],
    where: {
      status: { not: "CANCELLED" }
    },
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit
  });
  const providerIds = providers.map((p) => p.providerId);
  const providerDetails = await prisma.user.findMany({
    where: { id: { in: providerIds } },
    include: {
      providerProfile: {
        select: { restaurantName: true, logoUrl: true }
      }
    }
  });
  return providers.map((p) => {
    const detail = providerDetails.find((d) => d.id === p.providerId);
    return {
      id: p.providerId,
      restaurantName: detail?.providerProfile?.restaurantName || "Unknown",
      logoUrl: detail?.providerProfile?.logoUrl,
      totalRevenue: Number(p._sum.totalAmount) || 0,
      totalOrders: p._count.id
    };
  });
};
var getOrderStatusBreakdown = async () => {
  const statuses = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
  const counts = await Promise.all(
    statuses.map(
      (status) => prisma.orders.count({
        where: {
          status
        }
      })
    )
  );
  return statuses.map((status, index) => ({
    name: status,
    value: counts[index],
    color: getStatusColor(status)
  }));
};
var getStatusColor = (status) => {
  const colors = {
    PLACED: "#3b82f6",
    PREPARING: "#f59e0b",
    READY: "#8b5cf6",
    DELIVERED: "#10b981",
    CANCELLED: "#ef4444"
  };
  return colors[status] || "#6b7280";
};
var adminService = {
  getDashboardStats,
  getRevenueTrend,
  getRecentOrders,
  getTopProviders,
  getOrderStatusBreakdown,
  getAllUsers,
  getAllOrders,
  suspendUser,
  activateUser,
  deleteUser,
  updateOrderStatus,
  cancelOrder: cancelOrder3
};

// src/modules/admin/admin.controller.ts
var getDashboardStats2 = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getAllUsers2 = async (req, res) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getAllOrders2 = async (req, res) => {
  try {
    const result = await adminService.getAllOrders(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var suspendUser2 = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.suspendUser(userId);
    res.json({
      success: true,
      message: "User suspended",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var activateUser2 = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.activateUser(userId);
    res.json({
      success: true,
      message: "User activated",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var deleteUser2 = async (req, res) => {
  try {
    const { userId } = req.params;
    await adminService.deleteUser(userId);
    res.json({
      success: true,
      message: "User deleted"
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var updateOrderStatus2 = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const result = await adminService.updateOrderStatus(orderId, status);
    res.json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var cancelOrder4 = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await adminService.cancelOrder(orderId);
    res.json({
      success: true,
      message: "Order cancelled",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var getRevenueTrend2 = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = await adminService.getRevenueTrend(days);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
var getRecentOrders2 = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await adminService.getRecentOrders(limit);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
var getTopProviders2 = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data = await adminService.getTopProviders(limit);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
var getOrderStatusBreakdown2 = async (req, res) => {
  try {
    const data = await adminService.getOrderStatusBreakdown();
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
var AdminController = {
  getDashboardStats: getDashboardStats2,
  getRevenueTrend: getRevenueTrend2,
  getRecentOrders: getRecentOrders2,
  getTopProviders: getTopProviders2,
  getOrderStatusBreakdown: getOrderStatusBreakdown2,
  getAllUsers: getAllUsers2,
  getAllOrders: getAllOrders2,
  suspendUser: suspendUser2,
  activateUser: activateUser2,
  deleteUser: deleteUser2,
  updateOrderStatus: updateOrderStatus2,
  cancelOrder: cancelOrder4
};

// src/modules/admin/admin.routes.ts
var router6 = Router5();
router6.get(
  "/stats/revenue-trend",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getRevenueTrend
);
router6.get(
  "/stats/recent-orders",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getRecentOrders
);
router6.get(
  "/stats/top-providers",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getTopProviders
);
router6.get(
  "/stats/order-status",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getOrderStatusBreakdown
);
router6.get(
  "/stats",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getDashboardStats
);
router6.get(
  "/users",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getAllUsers
);
router6.get(
  "/orders",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.getAllOrders
);
router6.patch(
  "/users/:userId/suspend",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.suspendUser
);
router6.patch(
  "/users/:userId/activate",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.activateUser
);
router6.delete(
  "/users/:userId",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.deleteUser
);
router6.patch(
  "/orders/:orderId/status",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.updateOrderStatus
);
router6.patch(
  "/orders/:orderId/cancel",
  auth_default("ADMIN" /* ADMIN */),
  AdminController.cancelOrder
);
var adminRoutes = router6;

// src/modules/category/category.routes.ts
import { Router as Router6 } from "express";

// src/modules/category/category.service.ts
var createCategory = async (data) => {
  const existing = await prisma.category.findUnique({
    where: { name: data.name }
  });
  if (existing) {
    throw new Error("Category with this name already exists");
  }
  return prisma.category.create({
    data
  });
};
var getAllCategories = async (params = {}) => {
  const { page, limit, search } = params;
  const where = {};
  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive"
    };
  }
  if (page && limit) {
    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          _count: {
            select: { meals: true }
          }
        },
        orderBy: { name: "asc" },
        skip,
        take: limit
      }),
      prisma.category.count({ where })
    ]);
    return {
      data: categories,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  return prisma.category.findMany({
    where,
    include: {
      _count: {
        select: { meals: true }
      }
    },
    orderBy: { name: "asc" }
  });
};
var getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      meals: {
        where: { isAvailable: true },
        include: {
          provider: {
            include: {
              providerProfile: {
                select: { restaurantName: true }
              }
            }
          }
        }
      }
    }
  });
  if (!category) throw new Error("Category not found");
  return category;
};
var updateCategory = async (id, data) => {
  const category = await prisma.category.findUnique({
    where: { id }
  });
  if (!category) throw new Error("Category not found");
  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name }
    });
    if (existing) throw new Error("Category name already exists");
  }
  return prisma.category.update({
    where: { id },
    data
  });
};
var deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { meals: true }
      }
    }
  });
  if (!category) throw new Error("Category not found");
  if (category._count.meals > 0) {
    throw new Error("Cannot delete category with existing meals");
  }
  return prisma.category.delete({
    where: { id }
  });
};
var categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var getAllCategories2 = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : void 0;
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const search = req.query.search;
    const result = await categoryService.getAllCategories({
      page,
      limit,
      search
    });
    if (page && limit) {
      const paginatedResult = result;
      res.status(200).json({
        success: true,
        data: paginatedResult.data,
        meta: paginatedResult.meta
      });
    } else {
      res.status(200).json({
        success: true,
        data: result
      });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getCategoryById2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryById(id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(404).json({
      success: false,
      message: e.message
    });
  }
};
var updateCategory2 = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.updateCategory(id, req.body);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var deleteCategory2 = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var CategoryController = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  getCategoryById: getCategoryById2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/modules/category/category.routes.ts
var router7 = Router6();
router7.get(
  "/",
  CategoryController.getAllCategories
);
router7.get(
  "/:id",
  CategoryController.getCategoryById
);
router7.post(
  "/",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.createCategory
);
router7.patch(
  "/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.updateCategory
);
router7.delete(
  "/:id",
  auth_default("ADMIN" /* ADMIN */),
  CategoryController.deleteCategory
);
var categoryRoutes = router7;

// src/modules/providerDashboard/providerDashboard.routes.ts
import { Router as Router7 } from "express";

// src/modules/providerDashboard/providerDashboard.service.ts
var getStats = async (providerId) => {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const [
    totalOrders,
    totalRevenue,
    pendingOrders,
    totalMeals,
    todayOrders,
    weeklyRevenueData
  ] = await Promise.all([
    prisma.orders.count({
      where: { providerId }
    }),
    prisma.orders.aggregate({
      where: { providerId },
      _sum: { totalAmount: true }
    }),
    prisma.orders.count({
      where: {
        providerId,
        status: { in: ["PLACED", "PREPARING"] }
      }
    }),
    prisma.meal.count({
      where: { providerId }
    }),
    prisma.orders.count({
      where: {
        providerId,
        createdAt: { gte: today }
      }
    }),
    prisma.orders.aggregate({
      where: {
        providerId,
        createdAt: { gte: weekAgo }
      },
      _sum: { totalAmount: true }
    })
  ]);
  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    pendingOrders,
    totalMeals,
    todayOrders,
    weeklyRevenue: weeklyRevenueData._sum.totalAmount || 0
  };
};
var getRecentOrders3 = async (providerId, options) => {
  const { page = 1, limit = 5 } = options;
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where: { providerId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        orderItems: {
          include: {
            meal: {
              select: {
                name: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.orders.count({ where: { providerId } })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: orders
  };
};
var getPopularMeals = async (providerId, limit = 5) => {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        providerId,
        status: { not: "CANCELLED" }
      }
    },
    include: {
      meal: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          price: true
        }
      }
    }
  });
  const mealStats = orderItems.reduce((acc, item) => {
    const mealId = item.mealId;
    if (!acc[mealId]) {
      acc[mealId] = {
        mealId,
        name: item.meal.name,
        imageUrl: item.meal.imageUrl,
        totalSold: 0,
        revenue: 0
      };
    }
    acc[mealId].totalSold += item.quantity;
    acc[mealId].revenue += Number(item.priceAtTime) * item.quantity;
    return acc;
  }, {});
  return Object.values(mealStats).sort((a, b) => b.totalSold - a.totalSold).slice(0, limit);
};
var getWeeklyChart = async (providerId) => {
  const weekAgo = /* @__PURE__ */ new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const orders = await prisma.orders.findMany({
    where: {
      providerId,
      createdAt: { gte: weekAgo }
    },
    select: {
      createdAt: true,
      totalAmount: true
    }
  });
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartData = days.map(
    (day) => ({
      day,
      orders: 0,
      revenue: 0
    })
  );
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const dayIndex = date.getDay();
    if (dayIndex >= 0 && dayIndex < 7) {
      const dayData = chartData[dayIndex];
      if (dayData) {
        dayData.orders += 1;
        dayData.revenue += Number(order.totalAmount);
      }
    }
  });
  return chartData;
};
var getMyMeals = async (providerId, options) => {
  const { page = 1, limit = 10, isAvailable } = options;
  const skip = (page - 1) * limit;
  const where = { providerId };
  if (isAvailable !== void 0) {
    where.isAvailable = isAvailable;
  }
  const [meals, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      include: {
        category: { select: { name: true } },
        _count: { select: { reviews: true, orderItems: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma.meal.count({ where })
  ]);
  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    },
    data: meals
  };
};
var providerDashboardService = {
  getStats,
  getRecentOrders: getRecentOrders3,
  getPopularMeals,
  getWeeklyChart,
  getMyMeals
};

// src/modules/providerDashboard/providerDashboard.controller.ts
var getStats2 = async (req, res) => {
  try {
    const user = req.user;
    const targetProviderId = req.headers["x-provider-id"] || user.id;
    if (user.role === "ADMIN" /* ADMIN */ && targetProviderId !== user.id) {
      const provider = await prisma.user.findFirst({
        where: { id: targetProviderId, role: "PROVIDER" /* PROVIDER */ }
      });
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: "Provider not found"
        });
      }
    }
    const stats = await providerDashboardService.getStats(targetProviderId);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getRecentOrders4 = async (req, res) => {
  try {
    const user = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const result = await providerDashboardService.getRecentOrders(user.id, {
      page,
      limit
    });
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getPopularMeals2 = async (req, res) => {
  try {
    const user = req.user;
    const limit = Number(req.query.limit) || 5;
    const result = await providerDashboardService.getPopularMeals(
      user.id,
      limit
    );
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getWeeklyChart2 = async (req, res) => {
  try {
    const user = req.user;
    const result = await providerDashboardService.getWeeklyChart(user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message
    });
  }
};
var getMyMeals2 = async (req, res) => {
  try {
    const user = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const options = {
      page,
      limit
    };
    if (req.query.isAvailable === "true") {
      options.isAvailable = true;
    } else if (req.query.isAvailable === "false") {
      options.isAvailable = false;
    }
    const result = await providerDashboardService.getMyMeals(user.id, options);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
var ProviderDashboardController = {
  getStats: getStats2,
  getRecentOrders: getRecentOrders4,
  getPopularMeals: getPopularMeals2,
  getWeeklyChart: getWeeklyChart2,
  getMyMeals: getMyMeals2
};

// src/modules/providerDashboard/providerDashboard.routes.ts
var router8 = Router7();
router8.get(
  "/stats",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderDashboardController.getStats
);
router8.get(
  "/orders",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderDashboardController.getRecentOrders
);
router8.get(
  "/popular-meals",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderDashboardController.getPopularMeals
);
router8.get(
  "/weekly-chart",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderDashboardController.getWeeklyChart
);
router8.get(
  "/meals",
  auth_default("PROVIDER" /* PROVIDER */, "ADMIN" /* ADMIN */),
  ProviderDashboardController.getMyMeals
);
var providerDashboardRoutes = router8;

// src/modules/user/user.routes.ts
import { Router as Router8 } from "express";

// src/modules/user/user.service.ts
var getMyProfile3 = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerProfile: true
    }
  });
  if (!user) throw new Error("User not found");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    phone: user.phone,
    role: user.role,
    restaurantName: user.providerProfile?.restaurantName,
    description: user.providerProfile?.description,
    address: user.providerProfile?.address,
    logoUrl: user.providerProfile?.logoUrl,
    openingHours: user.providerProfile?.openingHours
  };
};
var updateMyProfile = async (userId, data) => {
  const updateData = {};
  if (data.name !== void 0) updateData.name = data.name;
  if (data.image !== void 0) updateData.image = data.image;
  if (data.phone !== void 0) updateData.phone = data.phone;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  return updated;
};
var updateProviderProfile = async (userId, data) => {
  const updateData = {};
  if (data.restaurantName !== void 0) updateData.restaurantName = data.restaurantName;
  if (data.description !== void 0) updateData.description = data.description;
  if (data.address !== void 0) updateData.address = data.address;
  if (data.logoUrl !== void 0) updateData.logoUrl = data.logoUrl;
  if (data.openingHours !== void 0) updateData.openingHours = data.openingHours;
  const updated = await prisma.providerProfile.update({
    where: { userId },
    data: updateData
  });
  return updated;
};
var initProviderProfile = async (data) => {
  const { email, restaurantName, address } = data;
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (!user) throw new Error("User not found");
  return await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: {
      restaurantName,
      address
    },
    create: {
      userId: user.id,
      restaurantName,
      address,
      description: "",
      openingHours: ""
    }
  });
};
var userService = {
  getMyProfile: getMyProfile3,
  updateMyProfile,
  updateProviderProfile,
  initProviderProfile
};

// src/modules/user/user.controller.ts
var getProfile = async (req, res) => {
  try {
    const user = req.user;
    const profile = await userService.getMyProfile(user.id);
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message
    });
  }
};
var updateProfile3 = async (req, res) => {
  try {
    const user = req.user;
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
        logoUrl
      });
    }
    const updatedProfile = await userService.getMyProfile(user.id);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var initProviderProfile2 = async (req, res) => {
  try {
    const result = await userService.initProviderProfile(req.body);
    res.status(200).json({
      success: true,
      message: "Provider profile initialized successfully",
      data: result
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message || "Failed to initialize provider profile"
    });
  }
};
var UserController = {
  getProfile,
  updateProfile: updateProfile3,
  initProviderProfile: initProviderProfile2
};

// src/modules/user/user.routes.ts
var router9 = Router8();
router9.post(
  "/init-provider",
  UserController.initProviderProfile
);
router9.get(
  "/me",
  auth_default(),
  UserController.getProfile
);
router9.put(
  "/me",
  auth_default(),
  UserController.updateProfile
);
var userRouter = router9;

// src/middleware/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    date: Date()
  });
}

// src/app.ts
var app = express2();
var allowedOrigins = [
  "http://localhost:3000",
  "https://khabarbox.vercel.app"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(express2.json());
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
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
