import { db, storage } from "@/lib/firebase";
import { ImageResponse } from "next/og";
import { textOutlineStyle, textColorCodes, textSizes } from "./text";

export async function createImage(key: string, waitTime: number = 0) {
  try {
    if (!key) {
      throw new Error("Missing 'key' parameter");
    }
    if (waitTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    const dbRef = db.ref(key);
    const snapshot = await dbRef.get();
    const data = await snapshot.val();

    if (!data) {
      console.log("Data not found");
      throw new Error("Data not found");
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

    console.log("Image created");

    const blob = await image.blob();
    console.log("Blob generated:", blob);
    const stream = blob.stream();
    console.log("Blob stream generated:", stream);

    const metadata = {
      contentType: blob.type,
    };

    const fileName = `${key}.png`;
    const filePath = `images/${fileName}`;

    console.log("START UPLOAD IMAGE");
    const storageSnapshot = await storage
      .file(filePath)
      .save(blob.stream(), { metadata });

    console.log("Image uploaded successfully.", storageSnapshot);

    return "Image uploaded successfully.";
  } catch (error) {
    console.error("Error processing request:", error);
    throw new Error("Error processing request");
  }
}
