"use client";

import { useEffect, useState } from "react";

export default function List() {
  const [nftList, setNftList] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      const data = await response.json();
      console.log(data);
      setNftList(data.data);
    };

    fetchData();
  }, []);
  return (
    <>
      <main>
        <h1 className="py-6 text-2xl font-bold text-center">
          Degen Comment(仮)
        </h1>
        <h2 className="py-6 text-2xl font-bold text-center">
          Registed NFT List
        </h2>
        {nftList.length === 0 && <p>There is no registed NFT.</p>}
        {nftList.length > 0 && (
          <>
            {nftList.map((nft: any, index) => (
              <div key={index} className="border border-gray-300 p-4 my-4">
                <div className="flex">
                  <img
                    src={nft?.value?.image || ""}
                    alt={nft.value.name}
                    width="50px"
                  />
                  <p> {window.location.origin + "/api/" + nft.key}</p>

                  {/* <p> {nft.value.comment ? nft.value.comment.length : 0}</p> */}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </>
  );
}
