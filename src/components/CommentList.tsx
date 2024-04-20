"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { comment } from "postcss";
import { getDateTime } from "../../app/utils/getDateTime";
const CommentList = ({ comments }: { comments: any[] }) => {
  if (!comments || comments.length === 0) {
    return <div className="text-white"></div>;
  }
  console.log(comments);

  return (
    <>
      <h2 className="text-white text-lg font-bold pb-2">Comment</h2>
      <Card className="w-96 h-full overflow-y-auto bg-gray-700 border-none">
        <CardContent className="py-2 px-4">
          {comments.map((comment, index) => (
            <>
              {comment && (
                <div key={index} className="flex items-center py-2">
                  <Link
                    href={`https://warpcast.com/${comment?.profile?.userName}`}
                    target="_blank"
                  >
                    <Avatar className="mr-4 w-10 h-10">
                      <AvatarImage
                        src={comment?.profile?.pfpUrl || ""}
                        alt={comment?.profile?.displayName || "pfp"}
                      />
                      <AvatarFallback>
                        {comment?.profile?.displayName.charAt(0) || "🎩"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="">
                    <div className="flex text-xs text-gray-200">
                      <div className="">{comment.profile.displayName}</div>
                      <div className="px-1"></div>
                      <div className="">{getDateTime(comment.createAt)}</div>
                      <div className="px-1"></div>
                      <div className="-mt-1">
                        {comment.isSuperComment ? "🎩" : ""}
                      </div>
                    </div>
                    <div className="text-base text-white">
                      {comment.message}
                    </div>
                  </div>
                </div>
              )}
            </>
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export default CommentList;
