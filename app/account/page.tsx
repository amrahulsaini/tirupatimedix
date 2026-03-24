import type { Metadata } from "next";

import { AccountClient } from "@/app/_components/account-client";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Login with email OTP and manage your Tirupati Medix profile.",
};

export default function AccountPage() {
  return <AccountClient />;
}
