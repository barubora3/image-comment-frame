import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";

export const revalidate = 0;

export async function GET() {
  try {
    const dbRef = db.ref();
    const snapshot = await dbRef.get();

    if (snapshot.exists()) {
      const data = snapshot.val();
      let convertedData = Object.entries(data).map(([key, value]) => ({
        key,
        value,
      }));

      // 登録順にソート
      convertedData = convertedData.sort((a: any, b: any) => {
        if (a.value.createAt < b.value.createAt) {
          return 1;
        } else {
          return -1;
        }
      });

      return NextResponse.json({ data: convertedData }, { status: 200 });
    } else {
      return NextResponse.json({ data: [] }, { status: 200 });
    }
  } catch (error) {
    console.error("Error retrieving data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data" },
      { status: 500 }
    );
  }
}
