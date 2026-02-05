import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
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
      content: '🍱';
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
      <div class="name">Hey ${user.name || "Foodie"}! 👋</div>
      
      <p class="message">
        Thanks for joining <span class="highlight">KhabarBox</span> — your favorite food delivery partner! 
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
          If you didn't create this account, you can safely ignore this email — no action needed.
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
      <div class="footer-brand">🍱 KhabarBox</div>
      <p class="footer-text">
        Connecting food lovers with the best local restaurants. 
        Fresh, fast, and always delicious.
      </p>
      <div class="copyright">
        © 2025 KhabarBox. All rights reserved.<br>
        Made with ❤️ in Bangladesh
      </div>
    </div>
  </div>
</body>
</html>`,
        });

        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
