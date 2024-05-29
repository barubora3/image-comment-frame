import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { textColors, textSizes } from "../../utils/text";
import { createImage } from "../../utils/createImage";

export async function POST(req: Request) {
  console.time("addComment");
  let {
    comment: newComment,
    key,
    profile,
    fid,
  } = (await req.json()) as {
    comment: string;
    key: string;
    profile?: any;
    fid?: string;
  };

  if (!newComment || !key || (!profile && !fid)) {
    console.log("Missing 'comment' or 'key' or 'profile' parameter");
    return NextResponse.json(
      { error: "Missing 'comment' or 'key' or 'profile' parameter" },
      { status: 400 }
    );
  }

  if (!profile && fid) {
    console.time("frame get data");
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY!,
      },
    };
    const userInfo = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`,
      options
    );
    const userData = await userInfo.json();
    const pfpUrl = userData.users[0].pfp_url;
    const displayName = userData.users[0].display_name;
    const userName = userData.users[0].username;
    console.timeEnd("frame get data");

    profile = {
      fid: fid,
      displayName: displayName,
      pfpUrl: pfpUrl,
      userName: userName,
    };
  }

  const dbRef = db.ref(key);
  const snapshot = await dbRef.get();
  const data = await snapshot.val();
  let comment = data.comment || [];
  // console.log("comment", comment);

  const now = new Date();
  const unixTimeMs = now.getTime();

  const commentObject = {
    message: newComment,
    color: textColors[Math.floor(Math.random() * textColors.length)],
    size: textSizes,
    // 100になると何も見えなくなるので上限を100より小さめに指定
    left: Math.floor(Math.random() * 90),
    top: Math.floor(Math.random() * 90),
    profile: profile,
    createAt: unixTimeMs,
  };
  comment.push(commentObject);

  await dbRef.update({ comment });

  // 画像生成して完了するまで待機
  console.time("createImage");
  await createImage(key);
  console.timeEnd("createImage");
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  console.timeEnd("addComment");

  return NextResponse.json({ message: "Comment complete !" }, { status: 200 });
}
