"use client";
import "@farcaster/auth-kit/styles.css";

import Head from "next/head";
import { AuthKitProvider, SignInButton, useProfile } from "@farcaster/auth-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { set, z } from "zod";

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

export default function Home() {
  return (
    <>
      <Head>
        <title>Farcaster AuthKit + NextAuth Demo</title>
      </Head>
      <main>
        <AuthKitProvider config={config}>
          <div style={{ position: "fixed", top: "12px", right: "12px" }}>
            <SignInButton />
          </div>

          <h1 className="py-6 text-2xl font-bold text-center">
            Degen Comment(仮)
          </h1>
          <RegistForm />

          {/* <Profile /> */}
        </AuthKitProvider>
      </main>
    </>
  );
}

import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import { MediaFetchAgent, Networks } from "@zoralabs/nft-hooks";

const API_ENDPOINT = "https://api.zora.co/graphql";
const zdk = new ZDK({ endpoint: API_ENDPOINT }); // Defaults to Ethereum Mainnet

function RegistForm() {
  const profile = useProfile();
  const {
    isAuthenticated,
    profile: { fid, displayName, custody, pfpUrl },
  } = profile;

  // step1
  const [currentStep, setCurrentStep] = useState(0);
  const [zoraUrl, setZoraUrl] = useState("");

  // step2
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  // const [creator, setCreator] = useState("");
  const [firstMinter, setFirstMinter] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");

  // step3
  const [shareUrl, setShareUrl] = useState("");

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

  const networks = {
    zora: { network: ZDKNetwork.Zora, chain: ZDKChain.ZoraMainnet },
    base: { network: ZDKNetwork.Base, chain: ZDKChain.BaseMainnet },
    eth: { network: ZDKNetwork.Ethereum, chain: ZDKChain.Mainnet },
    oeth: { network: ZDKNetwork.Optimism, chain: ZDKChain.OptimismMainnet },
  };
  const networkList = Object.keys(networks);

  function isValidEVMAddress(address: string) {
    // アドレスの先頭の"0x"を除去
    const cleanedAddress = address.toLowerCase().replace("0x", "");

    // アドレスの長さが40文字（先頭の"0x"を除く）であることを確認
    if (cleanedAddress.length !== 40) {
      return false;
    }

    // アドレスが16進数の文字のみで構成されていることを確認
    const hexRegex = /^[0-9a-f]+$/;
    if (!hexRegex.test(cleanedAddress)) {
      return false;
    }

    // すべての条件を満たす場合はtrueを返す
    return true;
  }

  function isValidTokenId(tokenId: string) {
    // tokenIdがstring型の場合、number型に変換できるかどうかを確認
    if (typeof tokenId === "string") {
      const parsedTokenId = parseInt(tokenId, 10);
      return !isNaN(parsedTokenId) && parsedTokenId.toString() === tokenId;
    }

    // tokenIdがnumber型であることを確認
    return typeof tokenId === "number" && !isNaN(tokenId);
  }

  const step1 = async () => {
    if (zoraUrl === "") {
      alert("Please input Zora URL");
    }
    // バリデーションチェック
    let parts;
    let network;
    let contractAddress;
    let tokenId;
    try {
      parts = zoraUrl.split("/");
      network = parts[4].split(":")[0];
      contractAddress = parts[4].split(":")[1];
      tokenId = parts[5];
      if (
        !networkList.includes(network) ||
        !isValidEVMAddress(contractAddress) ||
        !isValidTokenId(tokenId)
      ) {
        alert(
          "Invalid Zora URL\nnetwork: " +
            network +
            "\ncontractAddress: " +
            contractAddress +
            "\ntokenId: " +
            tokenId
        );
        return;
      }
    } catch (e) {
      alert("Invalid Zora URL");
      return;
    }

    // チェックがOKならばNFT情報を取得
    const networkName = networks[network as keyof typeof networks]["network"];
    const chain = networks[network as keyof typeof networks]["chain"];
    const networkInfo = {
      network: networkName,
      chain: chain,
    };

    const API_ENDPOINT = "https://api.zora.co/graphql";
    const args = {
      endPoint: API_ENDPOINT,
      networks: [networkInfo],
      // apiKey: process.env.API_KEY,
    };

    const zdk = new ZDK(args); // All arguments
    const res: any = await zdk.token({
      token: {
        address: contractAddress,
        tokenId: tokenId,
      },
    });
    console.log(res);
    // const collection = await zdk.collection({ address: contractAddress });
    // console.log(collection);

    setContractAddress(contractAddress);
    setTokenId(tokenId);
    setNetworkName(network);

    setName(res?.token?.token?.name);

    const fetchAgent = new MediaFetchAgent(Networks.MAINNET);
    const ipfsHash = res.token?.token?.image?.url?.replace("ipfs://", "");
    const imageResult: any = await fetchAgent.fetchContent(
      // "https://ipfs.io/ipfs/" + ipfsHash,
      "https://ipfs.decentralized-content.com/ipfs/" + ipfsHash,
      "application/json"
    );
    console.log(imageResult);
    console.log(imageResult.uri);
    setImage(imageResult?.uri);

    // 次のステップへ
    setCurrentStep(1);
  };

  const step2 = async () => {
    const key = networkName + ":" + contractAddress + ":" + tokenId;
    const value = {
      contractAddress,
      tokenId,
      network: networkName,
      image: image,
      name,
      createAt: new Date().toISOString(),
      registor: {
        fid,
        displayName,
        custody,
        pfpUrl,
      },
      comment: [],
    };
    const data = {
      key,
      value,
    };

    const response = await fetch("/api/regist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const res = await response.json();
      setShareUrl(window.location.origin + "/api/" + key);
      alert(res.message);

      setCurrentStep(2);
    } else {
      alert("something wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen -mt-40">
      {currentStep === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <Label className="block mb-4 font-bold text-gray-700">
            Step1. Please input Zora URL
          </Label>
          <Input
            type="text"
            placeholder="https://zora.co/collect/zora:contractAddress/tokenId"
            value={zoraUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setZoraUrl(e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-center pt-4">
            <Button onClick={step1}>Confirm</Button>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <Label className="block mb-4 font-bold text-gray-700">
            Step2. Confrim Infomation
          </Label>

          <>
            <img src={image} alt="NFT" className="w-full h-96 object-cover" />
            <div className="mt-4">
              <Label className="block mb-4 font-bold text-gray-700">Name</Label>
              <p>{name}</p>
            </div>
          </>

          <div className="text-center pt-4">
            <Button onClick={() => setCurrentStep(0)}>back</Button>
            <Button onClick={step2}>Regist</Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <Label className="block mb-4 font-bold text-gray-700">
            Step3. Registoration Complete 🎉
          </Label>

          <>
            <div>Share this url in Farcaster!</div>
            <div>{shareUrl}</div>
            <Button onClick={() => setCurrentStep(0)}>back</Button>
          </>
        </div>
      )}
    </div>
  );
}
