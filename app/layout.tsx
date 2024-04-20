import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "../src/components/Provider";
import { Header } from "../src/components/Header";
import { AuthKitProvider, SignInButton } from "@farcaster/auth-kit";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: "Degen Comment",
  description: "Degen Comment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Providers>
        <>
          <Header />

          {children}
        </>
      </Providers>
      {/* </AuthKitProvider> */}
    </>
  );
}
