"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProgressCircle from "@/components/ProgressCircle";
import { toast } from "react-hot-toast";
export default function List() {
  const [nftList, setNftList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await fetch("/api/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setNftList(data.data);
      setIsLoading(false);
    };

    fetchData();
  }, []);
  if (isLoading) return <ProgressCircle />;
  return (
    <div className="">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white text-center md:text-left">
          Registered NFTs
        </h1>
        {nftList.length === 0 ? (
          <p className="text-lg text-white">There are no registered NFTs.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nftList.map((nft: any, index) => (
              <div
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                key={index}
              >
                <Link href={`/comment/${nft.key}`}>
                  <img
                    src={nft?.value?.image || ""}
                    alt={nft.value.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{nft.value.name}</h2>

                  <div className="mb-4">
                    <div className=" mb-1">Frame URL:</div>
                    <span
                      className=" break-all cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          window.location.origin + "/api/" + nft.key
                        );
                        toast.success("Copied to clipboard !");
                      }}
                    >
                      {window.location.origin + "/api/" + nft.key}
                    </span>
                  </div>
                  {/* <p className="text-gray-500">
                      Comments: {nft.value.comment ? nft.value.comment.length : 0}
                    </p> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
