import { NextResponse } from "next/server";
export const revalidate = 0;

export async function POST(request: Request) {
  console.log("BBBBBB");
  let body: any;
  try {
    const text = await request.text();
    console.log("Raw request body:", text);

    body = JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse request body:", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log(body);

  const { networkName, contractAddress, tokenId } = body;

  if (!networkName || !contractAddress || !tokenId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

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
