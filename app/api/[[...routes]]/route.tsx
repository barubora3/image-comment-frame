/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { db } from "@/lib/firebase";
import { createSystem } from "frog/ui";

const { Box, Image, VStack, Heading, Text } = createSystem({
  colors: {
    white: "#fff",
    black: "#000",
  },
  fontSizes: {
    small: 0.01,
    medium: 0.02,
    large: 0.03,
  },
});

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  headers: {
    "cache-control": "max-age=0",
  },
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/:id", async (c) => {
  const { buttonValue, inputText, status, req, url, frameData } = c;

  console.log(frameData);
  const id = req.param("id");

  const dbRef = db.ref(id);
  const snapshot = await dbRef.get();

  if (!snapshot.exists()) {
    return c.res({
      image: (
        <div
          style={{
            alignItems: "center",
            background:
              status === "response"
                ? "linear-gradient(to right, #432889, #17101F)"
                : "black",
            backgroundSize: "100% 100%",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            height: "100%",
            justifyContent: "center",
            textAlign: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 60,
              fontStyle: "normal",
              letterSpacing: "-0.025em",
              lineHeight: 1.4,
              marginTop: 30,
              padding: "0 120px",
              whiteSpace: "pre-wrap",
            }}
          >
            Invalid URL !
          </div>
        </div>
      ),
      intents: [
        <Button.Link key="to" href={url.replace(/\/api\/.*/, "")}>
          Regist or Search
        </Button.Link>,
      ],
    });
  }
  const data = await snapshot.val();
  const image = data.image;
  let comment = data.comment || [];

  if (inputText && buttonValue === "doComment") {
    const commentObject = {
      message: inputText,

      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),

      fid: frameData?.fid,

      createAt: frameData?.timestamp || new Date().toISOString,
    };

    comment.push(commentObject);
    await dbRef.update({ comment });
  }

  console.log(buttonValue);
  if (buttonValue === "noComment") {
    comment = [];
  }

  return c.res({
    image: (
      <Box grow alignHorizontal="center" backgroundColor="black" width="100%">
        <Image src={image} objectFit="cover" height="100%" />
        {comment.map((com: any, index: number) => (
          <div
            style={{
              color: "white",
              position: "absolute",
              fontSize: 50,
              top: com.top + "%",
              left: com.left + "%",
            }}
            key={index}
          >
            {com.message}
          </div>
        ))}
      </Box>
    ),
    intents: [
      <TextInput key="commentText" placeholder="Enter your comment..." />,
      <Button key="commentButton" value="doComment">
        Comment
      </Button>,
      <Button.Link key="superComment" href={url.replace(/\/api\/.*/, "")}>
        Super Comment(未実装)
      </Button.Link>,
      <Button.Link key="regist" href={url.replace(/\/api\/.*/, "")}>
        Other
      </Button.Link>,
      <Button key="noComment" value="noComment">
        Original
      </Button>,
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
