/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { db } from "@/lib/firebase";
import { createSystem } from "frog/ui";
import { textColors, textSizes } from "../../utils/text";
const options = {
  method: "GET",
  headers: { accept: "application/json", api_key: process.env.NEYNAR_API_KEY! },
};

const { Box, Image, VStack, Heading, Text } = createSystem({
  colors: {
    white: "#fff",
    black: "#000",
    background: "#000000",
  },
  fontSizes: {
    small: 0.01,
    medium: 0.02,
    large: 0.03,
  },
});

const textOutlineSize = "1px";
const textOutline1 = `${textOutlineSize} ${textOutlineSize} 0`;
const textOutline2 = `-${textOutlineSize} ${textOutlineSize} 0`;
const textOutline3 = `-${textOutlineSize} -${textOutlineSize} 0`;
const textOutline4 = `${textOutlineSize} -${textOutlineSize} 0`;

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: process.env.NEYNAR_API_KEY! }),
  headers: {
    "cache-control": "max-age=0",
  },
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/:id", async (c) => {
  const { buttonValue, inputText, status, req, url, frameData } = c;

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
    const userInfo = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${frameData?.fid}&viewer_fid=3`,
      options
    );
    const userData = await userInfo.json();
    const pfpUrl = userData.users[0].pfp_url;
    const displayName = userData.users[0].display_name;
    const userName = userData.users[0].user_name;

    const commentObject = {
      message: inputText,
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      color: textColors[Math.floor(Math.random() * textColors.length)],
      size: textSizes,
      profile: {
        fid: frameData?.fid,
        displayName: displayName,
        userName: userName,
        pfpUrl: pfpUrl,
      },

      createAt: frameData?.timestamp,
    };

    comment.push(commentObject);
    await dbRef.update({ comment });
  }

  if (buttonValue === "noComment") {
    comment = [];
  }

  return c.res({
    image: (
      <Box grow alignHorizontal="center">
        <span
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
          <Image src={image} objectFit="cover" height="100%" />
          {comment.map((com: any, index: number) => (
            <div
              style={{
                color: "white",
                position: "absolute",
                fontSize: com.size || textSizes,
                top: com.top + "%",
                left: com.left + "%",
                whiteSpace: "nowrap",
                textShadow: `${textOutline1} ${
                  com?.color || "black"
                }, ${textOutline2} ${com?.color || "black"}, ${textOutline3} ${
                  com?.color || "black"
                }, ${textOutline4} ${com?.color || "black"}`,
              }}
              key={index}
            >
              {com.message}
            </div>
          ))}
        </span>
      </Box>
    ),
    intents: [
      <TextInput key="commentText" placeholder="Enter your comment..." />,
      <Button key="commentButton" value="doComment">
        Comment
      </Button>,
      <Button.Link
        key="superComment"
        href={url.replace(/\/api\/.*/, "/comment/" + id)}
      >
        Super Comment
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
