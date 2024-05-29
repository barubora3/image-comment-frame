/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
// import { neynar } from 'frog/hubs'
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { db, storage } from "@/lib/firebase";
import { createSystem } from "frog/ui";

import {
  textColors,
  textSizes,
  textColorCodes,
  textOutlineStyle,
} from "../../utils/text";
import { getImageUrl, getZoraUrl } from "../../utils/url";
import { createImage } from "../../utils/createImage";
// const options = {
//   method: "GET",
//   headers: { accept: "application/json", api_key: process.env.NEYNAR_API_KEY! },
// };

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
  fonts: {
    default: [
      {
        name: "Open Sans",
        source: "google",
        weight: 400,
      },
      {
        name: "Open Sans",
        source: "google",
        weight: 600,
      },
    ],
  },
});

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  headers: {
    "cache-control": "max-age=0",
  },
  browserLocation: "/",
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY!,
      },
    },
  },
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/:id", async (c) => {
  const { buttonValue, inputText, status, req, url, frameData } = c;

  const id = req.param("id");

  if (inputText && buttonValue === "doComment") {
    // console.time("frame get data");
    // const userInfo = await fetch(
    //   `https://api.neynar.com/v2/farcaster/user/bulk?fids=${frameData?.fid}&viewer_fid=3`,
    //   options
    // );
    // const userData = await userInfo.json();
    // const pfpUrl = userData.users[0].pfp_url;
    // const displayName = userData.users[0].display_name;
    // const userName = userData.users[0].username;
    // console.timeEnd("frame get data");

    const response = fetch(
      `${process.env.NEXT_PUBLIC_SIWE_URI}api/addComment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: inputText,
          key: id,
          fid: frameData?.fid,
        }),
      }
    );

    return c.res({
      image: process.env.NEXT_PUBLIC_SIWE_URI + "loading.gif",
      intents: [
        <Button key="refresh" value="refresh">
          Refresh
        </Button>,
      ],
    });
    // await new Promise((resolve) => setTimeout(resolve, 1000));
  }

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
  const name = data.name;
  let comment = data.comment || [];

  if (buttonValue === "noComment") {
    comment = [];
  }

  const zoraUrl = getZoraUrl(id);

  const imageUrl = getImageUrl(id);
  return c.res({
    browserLocation: "/comment/" + id,
    image: imageUrl,
    // (
    // <Box grow alignHorizontal="center">
    //   <span
    //     style={{
    //       backgroundColor: "black",
    //       backgroundSize: "100% 100%",
    //       display: "flex",
    //       alignContent: "center",
    //       alignItems: "center",
    //       justifyContent: "center",
    //       width: "100%",
    //     }}
    //   >
    //     <Image src={image} objectFit="cover" height="100%" />
    //     {/* NFT名 */}
    //     <div
    //       style={{
    //         color: "white",
    //         fontSize: 60,
    //         position: "absolute",
    //         top: 0,
    //         left: 0,
    //         background: "rgba(255, 255, 255, 0.4)",
    //         padding: "4px 8px",
    //       }}
    //     >
    //       {name}
    //     </div>
    //     {comment.map((com: any, index: number) => {
    //       const fontSize = com.size || textSizes;
    //       const top = com.top + "%";
    //       const left = com.left + "%";
    //       const color = com?.color?.startsWith("#")
    //         ? com.color
    //         : textColorCodes[com.color as keyof typeof textColorCodes] ||
    //           "black";
    //       // const textShadow = textOutlineStyle(color);
    //       const textShadow = textOutlineStyle("#fff");

    //       const message = com.message || "";

    //       return (
    //         <div
    //           style={{
    //             // color: "white",
    //             color: color,
    //             position: "absolute",
    //             fontSize,
    //             top,
    //             left,
    //             whiteSpace: "nowrap",
    //             textShadow,
    //           }}
    //           key={index}
    //         >
    //           {message}
    //         </div>
    //       );
    //     })}
    //   </span>
    // </Box>
    // ),
    intents: [
      <TextInput key="commentText" placeholder="Enter your comment..." />,
      <Button key="commentButton" value="doComment">
        Comment
      </Button>,
      // <Button key="refresh" value="refresh">
      //   Refresh
      // </Button>,

      <Button.Link
        key="superComment"
        href={url.replace(/\/api\/.*/, "/comment/" + id)}
      >
        View
      </Button.Link>,

      <Button.Link key="addNFT" href={url.replace(/\/api\/.*/, "/register/")}>
        Add NFT
      </Button.Link>,
      // <Button.Link key="regist" href={url.replace(/\/api\/.*/, "")}>
      //   Other
      // </Button.Link>,
      <Button.Link key="regist" href={zoraUrl}>
        Mint
      </Button.Link>,
      // <Button key="noComment" value="noComment">
      //   Original
      // </Button>,
    ],
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
