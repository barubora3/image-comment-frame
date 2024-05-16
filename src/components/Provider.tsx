"use client";

import { AuthKitProvider } from "@farcaster/auth-kit";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import "@farcaster/auth-kit/styles.css";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base, zora } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl:
    "https://opt-mainnet.g.alchemy.com/v2/" +
    process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  domain: process.env.NEXT_PUBLIC_DOMAIN!,
  siweUri: process.env.NEXT_PUBLIC_SIWE_URI!,
};

// const rainbowConfig = getDefaultConfig({
//   appName: "Degen Comment",
//   projectId: process.env.,
//   chains: [mainnet, polygon, optimism, arbitrum, base, zora],
//   ssr: true, // If your dApp uses server side rendering (SSR)
// });
export function Providers({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎩</text></svg>"
          sizes="any"
        />
      </head>
      {/* <body className="bg-gradient-to-bl from-purple-400 to-indigo-400 min-h-screen "> */}
      <body className="bg-black  min-h-screen ">
        <AuthKitProvider config={config}>{children}</AuthKitProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
