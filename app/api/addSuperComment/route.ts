import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { ethers } from "ethers";

import { degenProvider, contractAddress } from "../../utils/blockchain";
import ABI from "../../utils/abi.json";

interface AddFreeCommentRequest {
  txHash: string;
}
export async function POST(req: Request) {
  const { txHash } = await req.json();
  console.log(txHash);

  const provider = new ethers.JsonRpcProvider(degenProvider);
  const contract = new ethers.Contract(contractAddress, ABI, provider);
  const iface = new ethers.Interface(ABI);

  const tx = await provider.getTransaction(txHash);

  if (!tx) {
    return NextResponse.json(
      { message: "Transaction not found !" },
      { status: 400 }
    );
  }
  // トランザクションデータをデコードして引数を取得
  const decodedArgs = iface.decodeFunctionData("addComment", tx.data);
  console.log(decodedArgs);

  const key = decodedArgs[0];
  const fid = Number(decodedArgs[1]);
  const message = decodedArgs[2];
  const size = Number(decodedArgs[3]);
  const color = decodedArgs[4];
  const left = Number(decodedArgs[5]);
  const top = Number(decodedArgs[6]);

  // get profile
  const userInfo = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
    }
  );
  const userData = await userInfo.json();
  console.log(userData);
  const pfpUrl = userData.users[0].pfp_url;
  const displayName = userData.users[0].display_name;

  const profile = {
    fid,
    displayName,
    pfpUrl,
  };

  const dbRef = db.ref(key);
  const snapshot = await dbRef.get();
  const data = await snapshot.val();
  let comment = data.comment || [];

  const now = new Date();
  const unixTimeMs = now.getTime();

  const commentObject = {
    message,
    size,
    left,
    top,
    color,
    profile,
    createAt: unixTimeMs,
  };

  comment.push(commentObject);
  console.log(comment);
  await dbRef.update({ comment });

  return NextResponse.json({ message: "Comment complete !" }, { status: 200 });
}
