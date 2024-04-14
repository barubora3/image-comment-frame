"use client";
import "@farcaster/auth-kit/styles.css";

import Head from "next/head";
import { AuthKitProvider, SignInButton, useProfile } from "@farcaster/auth-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { z } from "zod";

// export async function generateMetadata(): Promise<Metadata> {
//   const frameTags = await getFrameMetadata(
//     `${process.env.VERCEL_URL || "http://localhost:3000"}/api`
//   );
//   return {
//     other: frameTags,
//   };
// }

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl:
    "https://opt-mainnet.g.alchemy.com/v2/cpuacOtw2fy6itWrjMMtoSxqwdAdI1v6",
  domain: "localhost:3000",
  siweUri: "http://localhost:3000",
};

const formSchema = z.object({
  username: z.string().min(2).max(50),
});

export default function Home() {
  return (
    <>
      <Head>
        <title>Farcaster AuthKit + NextAuth Demo</title>
      </Head>
      <main style={{ fontFamily: "Inter, sans-serif" }}>
        <AuthKitProvider config={config}>
          <div style={{ position: "fixed", top: "12px", right: "12px" }}>
            <SignInButton />
          </div>

          <div style={{ paddingTop: "33vh", textAlign: "center" }}>
            <h1>Image Comment Frame(仮)</h1>

            <RegistForm />

            {/* <Profile /> */}
          </div>
        </AuthKitProvider>
      </main>
    </>
  );
}

import { ZDK } from "@zoralabs/zdk";

const API_ENDPOINT = "https://api.zora.co/graphql";
const zdk = new ZDK({ endpoint: API_ENDPOINT }); // Defaults to Ethereum Mainnet

function RegistForm() {
  const profile = useProfile();
  const {
    isAuthenticated,
    profile: { fid, displayName, custody },
  } = profile;

  const [currentStep, setCurrentStep] = useState(0);
  const [zoraUrl, setZoraUrl] = useState("");

  // if (!isAuthenticated) {
  //   return (
  //     <p>
  //       Click the "Sign in with Farcaster" button above, then scan the QR code
  //       to sign in.
  //     </p>
  //   );
  // }
  // step1 zoraのURLを入力
  // step2 登録情報の確認
  // step3 登録完了

  return (
    <div>
      {currentStep === 0 && (
        <>
          <Label></Label>
          <Input
            type="text"
            placeholder="https://zora.co/collect/zora:contractAddress/tokenId"
            width={"400px"}
            value={zoraUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setZoraUrl(e.target.value)
            }
          />

          <h1 className="text-3xl font-bold underline">Hello world!</h1>
          <Button>Confirm</Button>
        </>
      )}
    </div>
  );
}
