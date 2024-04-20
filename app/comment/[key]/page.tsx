"use client";
import ProgressCircle from "@/components/ProgressCircle";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useProfile } from "@farcaster/auth-kit";

import { ethers } from "ethers";
import {
  contractAddress,
  degenProvider,
  chainId,
} from "../../utils/blockchain";
import ABI from "../../utils/abi.json";
import { textColors } from "../../utils/text";
import { SignInButton } from "@farcaster/auth-kit";
import CommentList from "../../../src/components/CommentList";
import { authAtom } from "../../atoms/authAtom";
import { useSetAtom, useAtomValue } from "jotai";
import { shareUrlBase, embedParam } from "../../utils/url";

// share url
// https://warpcast.com/~/compose?text=Mint%20Untitiled%20for%20free%20%E2%9C%A8%0A%0Ahttps%3A%2F%2Ffar.quest%2Fcontracts%2Fdegen%2Funtitiled-79&embeds[]=https://far.quest/contracts/degen/untitiled-79&rand=0.92291

export default function Home() {
  const params = useParams();
  const key = decodeURIComponent(params.key as string);
  const profile = useProfile();

  const {
    isAuthenticated,
    profile: { fid, displayName, custody, pfpUrl, username },
  } = profile;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState<string>("");
  const [freeComment, setFreeComment] = useState("");
  const [superComment, setSuperComment] = useState({
    text: "",
    color: "#000000",
    size: 30,
    left: 0,
    top: 0,
  });

  const [comments, setComments] = useState<any>([]);

  const setAuthState = useSetAtom(authAtom);
  const authState = useAtomValue(authAtom);

  useEffect(() => {
    // ログインしたらjotaiに情報を書きこむ
    if (isAuthenticated && fid) {
      console.log("logged in");
      setAuthState({
        fid,
        displayName,
        pfpUrl,
        username,
      });
    }
  }, [isAuthenticated, fid]);

  useEffect(() => {
    console.log(authState);
    const fetchData = async () => {
      // frogのapiを叩く
      const response = await fetch(`/api/${key}`);
      // console.log(response);
      // const data = await response.json();
      // console.log(data);

      // DBから取得
      const response = await fetch(`/api/get?key=${key}`);

      const data = await response.json();
      setComments(data.data.comment || []);

      // 画像を取得
      const requestOptions = {
        method: "GET",
        headers: {
          "User-Agent": navigator.userAgent,
          Referer: document.location.href,
        },
        credentials: "include" as RequestCredentials,
      };
      // const imageRes = await fetch(`/api/${key}/image`, requestOptions);
      const imageRes = fetch(`/api/${key}/image`, requestOptions);
      console.log(imageRes);
      setIsLoading(false);
    };
    fetchData();
  }, [key]);

  const handleFreeCommentSubmit = async () => {
    if (freeComment.length > 10) {
      toast.error("Comments are limited to 10 characters.");
      return;
    }
    try {
      const response = await fetch(`/api/addComment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: freeComment,
          key: key,
          profile: {
            // fid: fid,
            // displayName: displayName,
            // pfpUrl: pfpUrl,
            // userName: username,
            fid: authState?.fid || fid,
            displayName: authState?.displayName || displayName,
            pfpUrl: authState?.pfpUrl || pfpUrl,
            userName: authState?.username || username,
          },
        }),
      });
      if (response.ok) {
        toast.success("Comment posted successfully !");
        location.reload();
        setFreeComment("");
      } else {
        toast.error("Failed to post the comment.");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handlesuperCommentSubmit = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      toast.error("window.ethreum not found");
      return;
    }
    try {
      await ethereum.request({ method: "eth_requestAccounts" });

      // チェーンを確認
      const currentChainId = await ethereum.request({ method: "eth_chainId" });
      console.log(chainId, currentChainId);
      if (currentChainId !== chainId) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainId }],
        });
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, ABI, signer);

      // keyが登録済みか確認
      const nft = await contract.nfts(key);
      const isRegisted = nft[1];

      let tx;
      if (!isRegisted) {
        // 未登録ならば登録作業も行う
        const res = await fetch(`/api/registerNFT?key=${key}`);

        // syndicate側での登録が完了するまで待つ
        // 本当はトランザクションの状況をポーリングするべきだが、今回は省略
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 料金を取得
      const fee = await contract.commentFee();

      tx = await contract.addComment(
        key,
        authState?.fid || fid,
        superComment.text,
        superComment.size,
        superComment.color,
        superComment.left,
        superComment.top,
        {
          value: fee,
        }
      );
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // dbに登録する関数を投げっぱなしにする
        fetch(`/api/addSuperComment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txHash: tx.hash,
          }),
        });

        toast.success("Super comment posted successfully !");
        setIsLoading(true);

        location.reload();
      } else {
        toast.error("Failed to post the super comment.");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.log(error);
    }
  };

  const RandomButton = ({ setSuperComment }: { setSuperComment: any }) => {
    // ランダムな値を生成するヘルパー関数
    const generateRandomValue = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // ボタンのクリックイベントハンドラー
    const handleRandomize = () => {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
        16
      )}`;
      const randomSize = generateRandomValue(30, 80);
      const randomLeft = generateRandomValue(0, 99);
      const randomTop = generateRandomValue(0, 99);

      setSuperComment({
        text: superComment.text,
        color: randomColor,
        size: randomSize,
        left: randomLeft,
        top: randomTop,
      });
    };

    return (
      <Button variant={"custom"} onClick={handleRandomize}>
        Randomize
      </Button>
    );
  };

  if (isLoading) {
    return <ProgressCircle />;
  }

  return (
    <>
      <div className="flex justify-center items-center ">
        <div className="relative">
          {/* <div
            className="w-full text-center relative"
            style={{ overflow: "hidden" }}
          >
            <img src={`/api/${key}/image`} />
            <div
              style={{
                color: superComment.color || "white",
                position: "absolute",
                fontSize: superComment.size,
                top: superComment.top + "%",
                left: superComment.left + "%",
                whiteSpace: "nowrap",
              }}
            >
              {superComment.text}
            </div>
          </div>
          <CommentList comments={comments} /> */}
          <div className=" w-[100vw]">
            <div
              className="mx-auto max-w-2xl text-center relative"
              style={{ overflow: "hidden" }}
            >
              <img src={`/api/${key}/image`} alt="Image" className="mx-auto" />
              <div
                style={{
                  // color: superComment.color || "white",
                  color: "white",
                  position: "absolute",
                  fontSize: superComment.size + "px",
                  top: superComment.top + "%",
                  left: superComment.left + "%",
                  whiteSpace: "nowrap",
                  textShadow: `1px 1px 0 ${superComment.color}, -1px 1px 0 ${superComment.color}, 1px -1px 0 ${superComment.color}, -1px -1px 0 ${superComment.color}`,
                }}
              >
                {superComment.text}
              </div>
            </div>
            <div className="absolute top-0 right-0 -mt-8 mr-10 2xl:mr-40">
              <CommentList comments={comments || []} />
            </div>
          </div>

          <div className="mt-4 text-center ">
            <div className="flex justify-center pt-4">
              {/* <div className="font-bold text-lg pb-1">Share Frame</div> */}

              <Button
                onClick={() => {
                  window.open(
                    `${shareUrlBase}Degen Comment🚀${window.location.origin}/comment/${key}${embedParam}${window.location.origin}/api/${key}`,
                    "_blank"
                  );
                }}
              >
                Share Frame
              </Button>
              <div className="px-2" />

              <Button
                onClick={() => {
                  window.open(
                    `https://zora.co/collect/${key.replace(
                      /:(?=[^:]*$)/,
                      "/"
                    )}`,
                    "_blank"
                  );
                }}
              >
                View on Zora
              </Button>
              {/* <div
                className=" break-all cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + "/api/" + key
                  );
                  toast.success("Copied to clipboard !");
                }}
              >
                {window.location.origin + "/api/" + key}
              </div> */}
            </div>
            {/*
            <div className="text-white text-center pt-2">
              <div className="font-bold text-lg pb-1">Zora URL</div>
              <div className=" break-all cursor-pointer">
                {`https://zora.co/collect/${key.replace(/:(?=[^:]*$)/, "/")}`}
              </div>
            </div>
             */}
            {!authState && (
              <div className="flex justify-center items-center flex-col">
                <div className="text-center text-white pt-8 pb-4 text-xl">
                  Please sign in to comment !
                </div>
                <SignInButton />
              </div>
            )}
            {authState && (
              <div className="flex justify-center item-center">
                <Accordion type="single" collapsible className="w-[800px]">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="text-xl font-bold text-white ">
                        Free Comment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            Comment
                          </Label>
                          <Input
                            type="text"
                            className="border border-gray-300 rounded-l px-2 py-1"
                            placeholder="Enter a comment (10 characters or less)"
                            value={freeComment}
                            onChange={(e) => setFreeComment(e.target.value)}
                            maxLength={10}
                          />
                        </div>
                        <div className="px-2" />
                        <div className="grid items-center gap-1.5">
                          <Label></Label>
                          <Button
                            variant={"custom"}
                            onClick={handleFreeCommentSubmit}
                          >
                            Submit
                          </Button>
                        </div>
                      </div>
                      <div className="text-white pt-4 text-left">
                        no preview
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <div className="text-xl font-bold text-white ">
                        Super Comment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {/* ランダムボタンの追加 */}

                      <div className="flex">
                        <div className="grid w-full max-w-xs items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            Comment
                          </Label>
                          <Input
                            type="text"
                            className="border border-gray-300 rounded-l px-2 py-1"
                            placeholder="Enter a comment"
                            value={superComment.text}
                            onChange={(e) =>
                              setSuperComment({
                                ...superComment,
                                text: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="px-2" />
                        {/* 
                    <select
                      id="colorSelect"
                      onChange={(e) =>
                        setSuperComment({
                          ...superComment,
                          color: e.target.value,
                        })
                      }
                    >
                      {textColors.map((color, index) => (
                        <option key={index} value={color}>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <span
                              style={{
                                width: "16px",
                                height: "16px",
                                backgroundColor: color,
                                marginRight: "8px",
                              }}
                            >
                              {color}
                            </span>
                          </div>
                        </option>
                      ))}
                    </select> */}

                        <div className="grid max-w-sm items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            Color
                          </Label>
                          <Input
                            type="color"
                            className="border border-gray-300 px-2 py-1 w-16"
                            value={superComment.color}
                            onChange={(e) =>
                              setSuperComment({
                                ...superComment,
                                color: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="px-2" />
                        <div className="grid max-w-sm items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            Size
                          </Label>
                          <Input
                            type="number"
                            className="border border-gray-300 rounded-r px-2 py-1"
                            placeholder="サイズ"
                            min="12"
                            max="80"
                            value={superComment.size}
                            onChange={(e) =>
                              setSuperComment({
                                ...superComment,
                                size: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="px-2" />
                        <div className="grid max-w-sm items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            X
                          </Label>
                          <Input
                            type="number"
                            className="border border-gray-300 rounded-r px-2 py-1"
                            placeholder="サイズ"
                            min="0"
                            max="99"
                            value={superComment.left}
                            onChange={(e) =>
                              setSuperComment({
                                ...superComment,
                                left: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="px-2" />
                        <div className="grid max-w-sm items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            Y
                          </Label>
                          <Input
                            type="number"
                            className="border border-gray-300 rounded-r px-2 py-1"
                            placeholder="サイズ"
                            min="0"
                            max="99"
                            value={superComment.top}
                            onChange={(e) =>
                              setSuperComment({
                                ...superComment,
                                top: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="px-2" />
                        <div className="grid items-center gap-1.5">
                          <Label></Label>
                          <RandomButton setSuperComment={setSuperComment} />
                        </div>
                      </div>
                      <div className="grid items-center pt-4">
                        <Label></Label>
                        <Button
                          variant={"custom"}
                          onClick={handlesuperCommentSubmit}
                        >
                          Submit
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
