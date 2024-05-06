import { NextResponse } from "next/server";
import { createImage } from "../../utils/createImage";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const encodedKey = searchParams.get("key");
  if (!encodedKey) {
    return NextResponse.json(
      { error: "Missing 'key' parameter" },
      { status: 400 }
    );
  }

  const key = decodeURIComponent(encodedKey);
  try {
    createImage(key);
    return NextResponse.json({ message: "Image uploaded successfully." });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
