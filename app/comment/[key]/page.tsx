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
import { textColors, textOutlineStylePreview } from "../../utils/text";
import { SignInButton } from "@farcaster/auth-kit";
import CommentList from "../../../src/components/CommentList";
import { authAtom } from "../../atoms/authAtom";
import { useSetAtom, useAtomValue } from "jotai";
import { shareUrlBase, embedParam } from "../../utils/url";
import { randomCommentList } from "../../utils/randomComments";

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
    size: 50,
    left: 0,
    top: 20,
  });

  const [comments, setComments] = useState<any>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);

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
    fetchData();
  }, [key]);

  const fetchData = async () => {
    // frogのapiを叩く
    // const frogRes = await fetch(`/api/${key}`);

    // DBから取得
    const response = await fetch(`/api/get?key=${key}`);
    const data = await response.json();
    setComments(data.data.comment || []);

    setIsLoading(false);

    // const imageRes = await fetch(`/api/${key}/image`, requestOptions);
    imageLoad();
  };

  const imageLoad = async () => {
    // 画像を取得
    const requestOptions = {
      method: "GET",
      headers: {
        "User-Agent": navigator.userAgent,
        Referer: document.location.href,
      },
      credentials: "include" as RequestCredentials,
    };
    setIsImageLoading(true);
    const imageRes = await fetch(`/api/${key}/image`, requestOptions);
    const imageBlob = await imageRes.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    setImageUrl(imageUrl);
    setIsImageLoading(false);
  };

  const handleFreeCommentSubmit = async () => {
    const textLimit = 20;
    if (freeComment.length > textLimit) {
      toast.error(`Comments are limited to ${textLimit} characters.`);
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
        // location.reload();
        setFreeComment("");
        fetchData();
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

      if (!isRegisted) {
        // 未登録ならば登録作業も行う
        const res = await fetch(`/api/registerNFT?key=${key}`);

        // syndicate側での登録が完了するまで待つ
        // 本当はトランザクションの状況をポーリングするべきだが、今回は省略
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // 料金を取得
      const fee = await contract.commentFee();

      const tx = await contract.addComment(
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
      const receipt = await tx.wait(0);
      // tx.waitが信用なら無いので0.5秒待つ
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (receipt.status === 1) {
        console.log(receipt);
        // dbに登録する関数を投げっぱなしにする
        await fetch(`/api/addSuperComment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txHash: receipt.hash,
          }),
        });

        toast.success("Super comment posted successfully !");
        setSuperComment({
          text: "",
          color: "#000000",
          size: 50,
          left: 0,
          top: 20,
        });
        fetchData();
      } else {
        toast.error("Failed to post the super comment.");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.log(error);
    }
  };

  const generateRandomComment = () => {
    const randomIndex = Math.floor(Math.random() * randomCommentList.length);
    return randomCommentList[randomIndex];
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
      <Button variant={"custom"} onClick={handleRandomize} className="px-2.5">
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
          <div className="w-[100vw]">
            <div
              className="mx-auto max-w-2xl text-center relative"
              style={{ overflow: "hidden" }}
            >
              {/* ogp画像の60%を指定 */}
              <div className="h-[378px] w-[720px] flex items-center justify-center relative">
                {isImageLoading && (
                  <div className="text-center">
                    <img
                      src="/loadingClock.gif"
                      className="w-20 h-20 mx-auto"
                    />
                  </div>
                )}
                {!isImageLoading && (
                  <img src={imageUrl} alt="Image" className="mx-auto" />
                )}

                {/* テキストのプレビュー */}
                <div
                  style={{
                    color: superComment.color || "white",
                    // color: "white",
                    position: "absolute",
                    fontSize: (superComment.size * 3) / 5,
                    top: superComment.top + "%",
                    left: superComment.left + "%",
                    whiteSpace: "nowrap",
                    // textShadow: textOutlineStyle(superComment.color),
                    textShadow: textOutlineStylePreview("#fff"),
                    fontFamily: "open-sans",
                  }}
                >
                  {superComment.text}
                </div>
              </div>
            </div>
            <div
              className="md:absolute md:px-0 md:top-0 md:right-0 md:-mt-8 md:mr-10 md:pt-0 2xl:mr-40 2xl:min-w-96
            px-4 pt-10 w-auto 
            "
            >
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
              <div className="flex justify-center item-center px-4 md:px-0">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full xl:w-[600px]"
                >
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="text-xl font-bold text-white">
                        Free Comment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col md:flex-row gap-4 ">
                        <div className="grid w-full lg:max-w-[352px] items-center gap-1.5">
                          <Label className="text-white font-bold text-left">
                            Comment
                          </Label>
                          <Input
                            type="text"
                            className="border border-gray-300 rounded-l py-1 w-full"
                            placeholder="Enter a comment)"
                            value={freeComment}
                            onChange={(e) => setFreeComment(e.target.value)}
                            maxLength={10}
                          />
                        </div>

                        <div className="grid items-center gap-1.5 ">
                          <Label className="text-white text-left ">
                            Random Comment
                          </Label>
                          <Button
                            variant={"custom"}
                            onClick={() =>
                              setFreeComment(generateRandomComment())
                            }
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                      <div className="grid items-center xl:justify-center pt-4">
                        <Button
                          variant={"custom"}
                          onClick={handleFreeCommentSubmit}
                          className="w-full xl:w-40"
                        >
                          Submit
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <div className="text-xl font-bold text-white">
                        Super Comment
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="grid w-full lg:max-w-[352px] items-center gap-1.5">
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

                        <div className="grid items-center gap-1.5 ">
                          <Label className="text-white text-left">
                            Random Comment
                          </Label>
                          <Button
                            variant={"custom"}
                            onClick={() => {
                              const newComment = generateRandomComment() || "";
                              setSuperComment({
                                ...superComment,
                                text: newComment,
                              });
                            }}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <div className="grid items-center gap-1.5">
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
                        <div className="grid items-center gap-1.5">
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
                        <div className="grid items-center gap-1.5">
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
                        <div className="grid items-center gap-1.5">
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
                        <div className="grid items-center gap-1.5">
                          <Label></Label>
                          <RandomButton setSuperComment={setSuperComment} />
                        </div>
                      </div>
                      <div className="grid items-center xl:justify-center pt-4">
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
