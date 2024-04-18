import { db } from "../../../src/lib/firebase";
import { NextRequest, NextResponse } from "next/server";

interface StoreDataRequest {
  key: string;
  value: any;
}

export async function POST(req: NextRequest) {
  const { key, value } = (await req.json()) as StoreDataRequest;
  console.log(key);
  console.log(value);

  try {
    const dbRef = db.ref(key);
    const snapshot = await dbRef.get();

    if (snapshot.exists()) {
      console.log("dbRef is not null");
      return NextResponse.json(
        { message: "This NFT is already registed !" },
        { status: 200 }
      );
    }

    if (value.creator === undefined) {
      console.log("creator is undefined");
      return NextResponse.json(
        { message: "Creator is not found !" },
        { status: 200 }
      );
    }

    const data = {
      contractAddress: value.contractAddress,
      tokenId: value.tokenId,
      network: value.network,
      image: value.image,
      name: value.name,
      createAt: value.createAt,
      registor: value.registor || {},
      comment: value.comment || [],
      creator: value.creator,
    };

    console.log(data);

    await dbRef.set(data);
    return NextResponse.json({ message: "Regist complete !" }, { status: 200 });
  } catch (error) {
    console.error("Error storing data:", error);
    return NextResponse.json(
      { error: "Failed to store data" },
      { status: 500 }
    );
  }
}
