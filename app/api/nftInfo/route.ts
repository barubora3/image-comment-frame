import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("BBBBBB");
  console.log(request.body);
  const { networkName, contractAddress, tokenId } = await request.json();

  console.log(
    `https://api.simplehash.com/api/v0/nfts/${networkName}/${contractAddress}/${tokenId}`
  );
  console.log(process.env.SIMPLE_HASH_API_KEY);

  const response = await fetch(
    `https://api.simplehash.com/api/v0/nfts/${networkName}/${contractAddress}/${tokenId}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.SIMPLE_HASH_API_KEY!,
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
