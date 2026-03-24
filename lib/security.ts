import crypto from "node:crypto";

const OTP_SECRET = process.env.OTP_SECRET ?? "tirupati-medix-otp-secret";

export function hashOtp(email: string, otp: string) {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase()}::${otp}::${OTP_SECRET}`)
    .digest("hex");
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_KEY_SECRET is missing.");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");

  return expected === params.signature;
}
