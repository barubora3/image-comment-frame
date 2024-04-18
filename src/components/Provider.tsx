"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import "@farcaster/auth-kit/styles.css";

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl:
    "https://opt-mainnet.g.alchemy.com/v2/cpuacOtw2fy6itWrjMMtoSxqwdAdI1v6",
  domain: "localhost:3000",
  siweUri: "http://localhost:3000",
};
export function Providers({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className="bg-gradient-to-bl from-purple-400 to-indigo-400 min-h-screen ">
        <AuthKitProvider config={config}>{children}</AuthKitProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
