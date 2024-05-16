import { db } from "../../../src/lib/firebase";
import { NextRequest, NextResponse } from "next/server";
import { createImage } from "../../utils/createImage";
import { init, fetchQuery } from "@airstack/node";
import { ethers } from "ethers";
import { networks } from "../../utils/networks";
import { ZoraNFTABI, ZoraCommentABI } from "../../utils/abi";

export const revalidate = 0;

init(process.env.AIRSTACK_API_KEY!);

const query = `
query MyQuery($timeFrame: TimeFrame!,$blockchain: TrendingBlockchain!,$criteria: TrendingMintsCriteria!) {
    TrendingMints(
      input: {timeFrame: $timeFrame, audience: farcaster, blockchain: $blockchain, criteria: $criteria, limit:3}
    ) {
      TrendingMint {
        address
        erc1155TokenID
        criteriaCount
        timeFrom
        timeTo
      }
    }
  }`;

let variables = {
  timeFrame: "eight_hours",
  blockchain: "",
  criteria: "unique_wallets",
};

const chains = ["degen", "base"];

export async function GET() {
  for (const chain of chains) {
    variables.blockchain = chain;
    // trend情報取得
    const { data, error } = await fetchQuery(query, variables);
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    // data.TrendingMints.TrendingMint.forEach(async (trend: any) => {

    for (const trend of data.TrendingMints?.TrendingMint || []) {
      const tokenId = trend.erc1155TokenID ? trend.erc1155TokenID : "1";
      const contractAddress = trend.address;
      const key = chain + ":" + trend.address + ":" + tokenId;
      const dbRef = db.ref(key);
      const snapshot = await dbRef.get();

      //   登録済みならスキップ
      if (snapshot.exists()) {
        continue;
      }

      console.log(
        "API URL:",
        process.env.NEXT_PUBLIC_SIWE_URI! + "/api/nftInfo"
      );
      console.log(
        "Request Body:",
        JSON.stringify({
          networkName: chain,
          contractAddress,
          tokenId,
        })
      );

      const response = await fetch(
        process.env.NEXT_PUBLIC_SIWE_URI! + "/api/nftInfo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            networkName: chain,
            contractAddress,
            tokenId,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Failed to fetch from SIWE API:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        continue;
      }

      const data = await response.json();
      const name = data.name;
      const image = data.image_url;
      // コントラクトのクリエイターを取得
      const provider = new ethers.JsonRpcProvider(
        networks[chain as keyof typeof networks]["rpc"]
      );

      const contract = new ethers.Contract(
        contractAddress,
        ZoraNFTABI,
        provider
      );
      let creator;
      try {
        creator = await contract.owner();
      } catch (e) {
        creator = data.contract.deployed_by;
      }
      if (!creator) {
        alert("Can't get owner address");
        return;
      }

      const value = {
        contractAddress,
        tokenId,
        network: chain,
        image: image,
        name,
        createAt: new Date().toISOString(),
        creator,
        comment: [],
      };

      console.log(data);

      await dbRef.set(value);
      await createImage(key);

      // 通知投稿
      const url = "https://api.neynar.com/v2/farcaster/cast";
      const text = `Today's trendhing mint.\n${name}`;
      const embeds = process.env.NEXT_PUBLIC_SIWE_URI + "/api/" + key;
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          api_key: process.env.NEYNAR_API_KEY!,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          embeds: [{ url: embeds }],
          channel_id: "zora",
        }),
      };

      fetch(url, options);

      // 1件登録したら終了
      return NextResponse.json(
        { message: "register trend nft finished" },
        { status: 200 }
      );
    }
  }

  return NextResponse.json(
    { message: "register trend nft finished" },
    { status: 200 }
  );
}
