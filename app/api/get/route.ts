import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { createSystem } from "frog/ui";

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

      return NextResponse.json({ data }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data" },
      { status: 500 }
    );
  }
}
