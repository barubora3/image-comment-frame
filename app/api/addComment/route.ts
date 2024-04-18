import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { textColors, textSizes } from "../../utils/text";

export async function POST(req: Request) {
  const {
    comment: newComment,
    key,
    profile,
  } = (await req.json()) as { comment: string; key: string; profile: any };

  if (!newComment || !key || !profile) {
    console.log("Missing 'comment' or 'key' or 'profile' parameter");
    return NextResponse.json(
      { error: "Missing 'comment' or 'key' or 'profile' parameter" },
      { status: 400 }
    );
  }

  const dbRef = db.ref(key);
  const snapshot = await dbRef.get();
  const data = await snapshot.val();
  let comment = data.comment || [];
  console.log("comment", comment);

  const now = new Date();
  const unixTimeMs = now.getTime();

  const commentObject = {
    message: newComment,
    color: textColors[Math.floor(Math.random() * textColors.length)],
    size: textSizes,
    left: Math.floor(Math.random() * 100),
    top: Math.floor(Math.random() * 100),
    profile: profile,
    createAt: unixTimeMs,
  };

  comment.push(commentObject);
  console.log(comment);
  await dbRef.update({ comment });

  return NextResponse.json({ message: "Comment complete !" }, { status: 200 });
}
