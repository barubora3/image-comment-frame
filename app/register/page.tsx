"use client";

import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@farcaster/auth-kit";
import { ethers } from "ethers";
import { useState } from "react";
import toast from "react-hot-toast";
import { shareUrlBase, embedParam, shareText } from "../utils/url";
import ProgressCircle from "@/components/ProgressCircle";
export default function Home() {
  return (
    <>
      <>
        <RegistForm />
      </>
    </>
  );
}

import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { networks } from "../utils/networks";
import { ZoraNFTABI, ZoraCommentABI } from "../utils/abi";

const API_ENDPOINT = "https://api.zora.co/graphql";
const zdk = new ZDK({ endpoint: API_ENDPOINT }); // Defaults to Ethereum Mainnet

function RegistForm() {
  const { width, height } = useWindowSize();

  // const {
  //   isAuthenticated,
  //   profile: { fid, displayName, custody, pfpUrl },
  // } = profile;

  const [isLoading, setIsLoading] = useState(false);

  // step1
  const [currentStep, setCurrentStep] = useState(0);
  const [zoraUrl, setZoraUrl] = useState("");

  // step2
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [creator, setCreator] = useState("");
  // const [creator, setCreator] = useState("");
  const [firstMinter, setFirstMinter] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [tokenId, setTokenId] = useState("");

  // step3
  const [shareUrl, setShareUrl] = useState("");
  const [commentPageUrl, setCommentPageUrl] = useState("");
  const [recycle, setRecycle] = useState(false);

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

  // Zora SDKを使った処理はコメントアウト
  // const step1 = async () => {
  //   if (zoraUrl === "") {
  //     alert("Please input Zora URL");
  //   }
  //   // バリデーションチェック
  //   let parts;
  //   let network;
  //   let contractAddress;
  //   let tokenId;
  //   try {
  //     parts = zoraUrl.split("/");
  //     network = parts[4].split(":")[0];
  //     contractAddress = parts[4].split(":")[1];
  //     tokenId = parts[5];
  //     if (
  //       !networkList.includes(network) ||
  //       !isValidEVMAddress(contractAddress) ||
  //       !isValidTokenId(tokenId)
  //     ) {
  //       alert(
  //         "Invalid Zora URL\nnetwork: " +
  //           network +
  //           "\ncontractAddress: " +
  //           contractAddress +
  //           "\ntokenId: " +
  //           tokenId
  //       );
  //       return;
  //     }
  //   } catch (e) {
  //     alert("Invalid Zora URL");
  //     return;
  //   }

  //   // チェックがOKならばNFT情報を取得
  //   const networkName = networks[network as keyof typeof networks]["network"];
  //   const chain = networks[network as keyof typeof networks]["chain"];
  //   const networkInfo = {
  //     network: networkName,
  //     chain: chain,
  //   };

  //   const API_ENDPOINT = "https://api.zora.co/graphql";
  //   const args = {
  //     endPoint: API_ENDPOINT,
  //     networks: [networkInfo],
  //     // apiKey: process.env.API_KEY,
  //   };

  //   const zdk = new ZDK(args); // All arguments
  //   const res: any = await zdk.token({
  //     token: {
  //       address: contractAddress,
  //       tokenId: tokenId,
  //     },
  //   });
  //   console.log(res);
  //   // const collection = await zdk.collection({ address: contractAddress });
  //   // console.log(collection);

  //   // コントラクトのクリエイターを取得
  //   const provider = new ethers.JsonRpcProvider(
  //     networks[network as keyof typeof networks]["rpc"]
  //   );
  //   // Zoraで発行されたNFTの場合はowner関数で取れるっぽい
  //   const contract = new ethers.Contract(contractAddress, ZoraNFTABI, provider);
  //   let ownerAddress;
  //   try {
  //     ownerAddress = await contract.owner();
  //   } catch (e) {
  //     console.log(e);
  //     // ownerが取れなかったらコントラクトデプロイヤーを取得
  //     const deployTransaction = await provider.getTransaction(contractAddress);
  //     ownerAddress = deployTransaction?.from;

  //     if (!ownerAddress) {
  //       alert("Can't get owner address");
  //       return;
  //     }
  //   }

  //   setContractAddress(contractAddress);
  //   setTokenId(tokenId);
  //   setNetworkName(network);
  //   setName(res?.token?.token?.name);
  //   setCreator(ownerAddress);

  //   const fetchAgent = new MediaFetchAgent(Networks.MAINNET);
  //   const ipfsHash = res.token?.token?.image?.url?.replace("ipfs://", "");
  //   const imageResult: any = await fetchAgent.fetchContent(
  //     // "https://ipfs.io/ipfs/" + ipfsHash,
  //     "https://ipfs.decentralized-content.com/ipfs/" + ipfsHash,
  //     "application/json"
  //   );
  //   console.log(imageResult);
  //   console.log(imageResult.uri);
  //   setImage(imageResult?.uri);

  //   // 次のステップへ
  //   setCurrentStep(1);
  // };

  const step1 = async () => {
    if (zoraUrl === "") {
      alert("Please input Zora URL");
      return;
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
      if (!tokenId) {
        tokenId = "1";
      }
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

    setIsLoading(true);

    // チェックがOKならばNFT情報を取得
    const networkName = networks[network as keyof typeof networks]["network"];
    const response = await fetch("/api/nftInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ networkName, contractAddress, tokenId }),
    });

    const data = await response.json();

    // コントラクトのクリエイターを取得
    const provider = new ethers.JsonRpcProvider(
      networks[network as keyof typeof networks]["rpc"]
    );
    // Zoraで発行されたNFTの場合はowner関数で取れるっぽい
    const contract = new ethers.Contract(contractAddress, ZoraNFTABI, provider);
    let ownerAddress;
    try {
      ownerAddress = await contract.owner();

      // // Zoraのコントラクトならばコメントを取得
      // const commentContract = new ethers.Contract(
      //   networks[network as keyof typeof networks]["commentContract"],
      //   ZoraCommentABI,
      //   provider
      // );

      // // イベントフィルタを作成
      // // const filter = {
      // //   address: contractAddress,
      // //   topics: [
      // //     ethers.id("MintComment(address,address,uint256,uint256,string)"),
      // //   ],
      // // };
      // // const filter = contract.filters.MintComment();

      // // 最新のブロック番号を取得
      // let latestBlock = await provider.getBlockNumber();

      // // ブロック範囲をバッチサイズに分割
      // const batchSize = 10000; // 適宜調整してください

      // let allLogs: ethers.Log[] = [];

      // // 0まで遡ると重いので100000までに制限
      // // latestBlock = 12779099;
      // for (let i = latestBlock; i >= 12778099; i -= batchSize) {
      //   const fromBlock = Math.max(i - batchSize + 1, 0);
      //   const toBlock = i;

      //   // イベントを取得
      //   const logs = await provider.getLogs({
      //     // ...filter,
      //     topics: [null, null, ethers.zeroPadValue(contractAddress, 32), null],
      //     address:
      //       networks[network as keyof typeof networks]["commentContract"],
      //     fromBlock: fromBlock,
      //     toBlock: toBlock,
      //   });
      //   // const logs = await contract.queryFilter(filter, fromBlock, toBlock);

      //   console.log(fromBlock, toBlock);
      //   console.log(logs);

      //   if (logs.length > 0) {
      //     allLogs = allLogs.concat(logs);

      //     // コメントが10件以上取得できたら終了
      //     if (allLogs.length >= 10) {
      //       break;
      //     }
      //   }
      // }

      // console.log(allLogs);

      // // コメントを配列に格納
      // const comments = allLogs.map((log: any) => {
      //   const event = commentContract.interface.parseLog(log);
      //   console.log(event);
      //   return event ? event.args.comment : "";
      // });

      // console.log(comments);

      // コメントも取る
    } catch (e) {
      console.log(e);
      // ownerが取れなかったらコントラクトデプロイヤーを取得
      // const deployTransaction = await provider.getTransaction(contractAddress);
      ownerAddress = data.contract.deployed_by;

      if (!ownerAddress) {
        alert("Can't get owner address");
        return;
      }
    }

    setContractAddress(contractAddress);
    setTokenId(tokenId);
    setNetworkName(network);
    setName(data.name);
    setCreator(ownerAddress);

    console.log(data);

    setImage(data.image_url);

    setIsLoading(false);
    // 次のステップへ
    setCurrentStep(1);
  };

  const step2 = async () => {
    setIsLoading(true);
    const key = networkName + ":" + contractAddress + ":" + tokenId;
    const value = {
      contractAddress,
      tokenId,
      network: networkName,
      image: image,
      name,
      createAt: new Date().toISOString(),
      // registor: {
      //   fid,
      //   displayName,
      //   custody,
      //   pfpUrl,
      // },
      creator,
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
      setCommentPageUrl(window.location.origin + "/comment/" + key);

      setCurrentStep(2);

      setRecycle(true);
      setTimeout(() => {
        setRecycle(false);
      }, 3000);
    } else {
      alert("something wrong!");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <ProgressCircle />;
  }

  return (
    <div className="flex justify-center items-center px-4 md:px-0 ">
      {currentStep === 0 && (
        <div className="w-full max-w-2xl pt-10">
          <div className="bg-white p-8 rounded-lg shadow-xl  ">
            <Label className="block mb-6 text-xl font-bold text-gray-700">
              Step 1: Input Zora URL
            </Label>
            <Input
              key={zoraUrl}
              type="text"
              placeholder="https://zora.co/collect/zora:contractAddress/tokenId"
              value={zoraUrl}
              onChange={(e) => setZoraUrl(e.target.value)}
              className="w-full px-4 py-3 mb-4 text-sm border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <div className="text-center space-x-4">
              <Button onClick={step1} variant={"custom"}>
                Register
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl ">
          <Label className="block mb-6 text-xl font-bold text-gray-700">
            Step 2: Confirm Information
          </Label>

          <>
            <img
              src={image}
              alt="NFT"
              className="w-full h-96 object-cover rounded-md mb-6"
            />
            <div className="mb-6">
              <Label className="block mb-2 font-bold text-gray-700">Name</Label>
              <p className="text-lg">{name}</p>
            </div>
            <div className="mb-6">
              <Label className="block mb-2 font-bold text-gray-700">
                Creator Address
              </Label>
              <p className="text-md">{creator}</p>
            </div>
          </>

          <div className="text-center space-x-4">
            <Button onClick={() => setCurrentStep(0)} variant={"cancel"}>
              Back
            </Button>
            <Button onClick={step2} variant={"custom"}>
              Register
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white p-8 rounded-lg shadow-xl  w-full max-w-2xl">
          <Confetti width={width} height={height} recycle={recycle} />
          <Label className="block mb-6 text-xl font-bold text-gray-700">
            Step 3: Registration Complete 🎉
          </Label>

          <>
            <div className="mb-4 text-lg">Share this URL on Farcaster!</div>

            <div
              className="p-4 mb-6 text-lg bg-gray-100 rounded-md break-all cursor-pointer"
              onClick={() => {
                // navigator.clipboard.writeText(shareUrl);
                // toast.success("Copied to clipboard !");
                window.open(
                  `${shareUrlBase}${shareText}${commentPageUrl}${embedParam}${shareUrl}`,
                  "_blank"
                );
              }}
            >
              {shareUrl}
            </div>
            <div className="text-center">
              <Button
                onClick={() => setCurrentStep(0)}
                className="px-6 py-3 text-lg font-semibold text-purple-500 bg-white rounded-md border-2 border-purple-500 hover:bg-purple-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              >
                Back
              </Button>
            </div>
          </>
        </div>
      )}
    </div>
  );
}
