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

const siteName = "Degen Comment";
const description =
  "The app will allow us to leave comments on the NFT. \nYou can superimpose text on the image and share your thoughts with artists and degens around the world.";
const url = "https://degen-comment.vercel.app/";
export const metadata: Metadata = {
  title: siteName,
  description: description,
  openGraph: {
    title: siteName,
    description,
    url,
    siteName,
    type: "website",
    images: [
      {
        url: `${url}/DEGEN_COMMENT.gif`,
        alt: siteName,
      },
    ],
  },
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
