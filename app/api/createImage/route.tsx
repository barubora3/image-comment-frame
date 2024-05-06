import { db, storage } from "@/lib/firebase";
import { ImageResponse } from "next/og";
import { textOutlineStyle, textColorCodes, textSizes } from "../../utils/text";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  console.log("image generate start");
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Missing 'key' parameter" },
        { status: 400 }
      );
    }

    const dbRef = db.ref(key);
    const snapshot = await dbRef.get();
    const data = await snapshot.val();

    if (!data) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    const name = data.name;
    const nftImage = data.image as string;
    const comment = data.comment || [];

    console.log("START CREATE IMAGE" + key);

    const image = new ImageResponse(
      (
        <div
          style={{
            backgroundColor: "black",
            backgroundSize: "100% 100%",
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <img src={nftImage} height="100%" />
          {/* NFT名 */}
          <div
            style={{
              color: "white",
              fontSize: 60,
              position: "absolute",
              top: 0,
              left: 0,
              background: "rgba(255, 255, 255, 0.4)",
              padding: "4px 8px",
            }}
          >
            {name}
          </div>
          {comment.map((com: any, index: number) => {
            const fontSize = com.size || textSizes;
            const top = com.top + "%";
            const left = com.left + "%";
            const color = com?.color?.startsWith("#")
              ? com.color
              : textColorCodes[com.color as keyof typeof textColorCodes] ||
                "black";
            // const textShadow = textOutlineStyle(color);
            const textShadow = textOutlineStyle("#fff");

            const message = com.message || "";

            return (
              <div
                style={{
                  // color: "white",
                  color: color,
                  position: "absolute",
                  fontSize,
                  top,
                  left,
                  whiteSpace: "nowrap",
                  textShadow,
                }}
                key={index}
              >
                {message}
              </div>
            );
          })}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    const blob = await image.blob();
    const metadata = {
      contentType: blob.type,
    };

    const fileName = `${key}.png`;
    const filePath = `images/${fileName}`;

    const storageSnapshot = await storage
      .file(filePath)
      .save(blob.stream(), { metadata });

    return NextResponse.json({ message: "Image uploaded successfully." });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}