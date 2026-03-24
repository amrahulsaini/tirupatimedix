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
  const baseUrl = process.env.APP_BASE_URL ?? "https://tirupatimedix.com";
  const logoUrl = `${baseUrl.replace(/\/$/, "")}/main-logo.webp`;

  await dbQuery(
    `INSERT INTO email_otps (email, otp_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
    [email, otpHash]
  );

  await sendMail({
    to: email,
    subject: "Your Tirupati Medix OTP",
    html: `<div style="background:#f5f7f4;padding:24px 10px;font-family:Arial,sans-serif;color:#13201b;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d6dfd9;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#0f4f3a,#166249);padding:14px 18px;color:#fff;display:flex;align-items:center;gap:10px;">
          <img src="${logoUrl}" alt="Tirupati Medix" width="34" height="34" style="border-radius:999px;background:#fff;padding:2px;" />
          <strong style="font-size:16px;letter-spacing:0.02em;">Tirupati Medix</strong>
        </div>
        <div style="padding:20px;line-height:1.6;">
          <h2 style="margin:0 0 8px;font-size:20px;">Login Verification</h2>
          <p style="margin:0 0 12px;">Use the OTP below to continue:</p>
          <div style="font-size:30px;letter-spacing:6px;font-weight:700;color:#0f4f3a;background:#edf4ee;border:1px dashed #166249;border-radius:10px;padding:10px 14px;display:inline-block;">${otp}</div>
          <p style="margin:14px 0 0;">This OTP is valid for 10 minutes.</p>
          <p style="margin:8px 0 0;color:#4e645b;">Did not receive OTP? Use the <strong>Resend OTP</strong> button on login screen.</p>
          <p style="margin:14px 0 0;color:#4e645b;">If this was not you, you can safely ignore this email.</p>
        </div>
      </div>
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
