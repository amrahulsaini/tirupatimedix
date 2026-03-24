import "server-only";

import { dbQuery } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { generateOtp, hashOtp } from "@/lib/security";

export function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

export async function createAndSendOtp(emailInput: string) {
  const email = normalizeEmail(emailInput);
  const otp = generateOtp();
  const otpHash = hashOtp(email, otp);

  await dbQuery(
    `INSERT INTO email_otps (email, otp_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [email, otpHash]
  );

  await sendMail({
    to: email,
    subject: "Your Tirupati Medix OTP",
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Tirupati Medix Login Verification</h2>
      <p>Your OTP is:</p>
      <p style="font-size: 26px; letter-spacing: 4px; font-weight: 700;">${otp}</p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>`,
  });
}

export async function verifyOtp(emailInput: string, otp: string) {
  const email = normalizeEmail(emailInput);
  const [rows] = await dbQuery<Array<{ id: number; otp_hash: string; expires_at: Date; consumed_at: Date | null }>>(
    `SELECT id, otp_hash, expires_at, consumed_at
     FROM email_otps
     WHERE email = ?
     ORDER BY id DESC
     LIMIT 1`,
    [email]
  );

  const record = rows[0];
  if (!record) {
    return { success: false, message: "OTP not found. Please request a new OTP." };
  }

  if (record.consumed_at) {
    return { success: false, message: "OTP already used. Please request a new OTP." };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, message: "OTP expired. Please request a new OTP." };
  }

  const incomingHash = hashOtp(email, otp.trim());
  if (incomingHash !== record.otp_hash) {
    await dbQuery(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?`, [record.id]);
    return { success: false, message: "Invalid OTP." };
  }

  await dbQuery(`UPDATE email_otps SET consumed_at = NOW() WHERE id = ?`, [record.id]);

  await dbQuery(
    `INSERT INTO users (email, is_email_verified)
     VALUES (?, 1)
     ON DUPLICATE KEY UPDATE is_email_verified = 1, updated_at = NOW()`,
    [email]
  );

  const [users] = await dbQuery<Array<{ id: number; email: string }>>(
    `SELECT id, email FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  if (!users[0]) {
    return { success: false, message: "Could not resolve user account." };
  }

  return {
    success: true,
    user: {
      id: users[0].id,
      email: users[0].email,
    },
  };
}
