import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { contractAddress, chainIdNumber } from "../../utils/blockchain";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encodedKey = searchParams.get("key");

  if (!encodedKey) {
    return NextResponse.json(
      { error: "Missing 'key' parameter" },
      { status: 400 }
    );
  }

  const key = decodeURIComponent(encodedKey);

  try {
    const dbRef = db.ref(key);
    const snapshot = await dbRef.get();
    if (snapshot.exists()) {
      const data = snapshot.val();

      console.log(data);
      const creator = data.creator;
      if (!creator) {
        return NextResponse.json(
          {
            error:
              "Creator not found. This NFT register infomation is invalid.",
          },
          { status: 400 }
        );
      }

      console.log(
        `{"projectId":"${process.env.SYNDICATE_PROJECT_ID}","contractAddress":"${contractAddress}","chainId":${chainIdNumber},"functionSignature":"registerNFT(string _nftKey, address _creator)","args":{"_nftKey":"${key}","_creator":"${creator}"}}`
      );

      // registerNFTを実行
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: `{"projectId":"${process.env.SYNDICATE_PROJECT_ID}","contractAddress":"${contractAddress}","chainId":${chainIdNumber},"functionSignature":"registerNFT(string _nftKey, address _creator)","args":{"_nftKey":"${key}","_creator":"${creator}"}}`,
      };

      const response = await fetch(
        "https://api.syndicate.io/transact/sendTransaction",
        options
      );
      console.log(response);
      const resData = await response.json();
      console.log(resData);

      return NextResponse.json({ data }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json(
      { error: "Failed to register data" },
      { status: 500 }
    );
  }
}
