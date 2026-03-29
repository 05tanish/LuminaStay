// app.js / server.js

import express from "express";

const app = express();

// ❗ ONLY for webhook route
app.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// Normal routes
app.use(express.json());