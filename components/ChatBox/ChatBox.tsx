"use client";
import { forwardRef } from "react";
import { User } from "firebase/auth";
import classNames from "@/utils/classNames";
import Avatar from "react-avatar";
import React from "react";
import { MessageType } from "../../app/page";

type ChatBoxType = {
  messages: MessageType[];
  user: User | null | undefined;
  ref: React.MutableRefObject<null>;
};

const ChatBox = ({ messages, user, ref }: ChatBoxType) => {
  return (
    <div className=" overflow-auto pr-10">
      <div className="flex flex-col  gap-3 mt-3 pb-8">
        {messages
          ?.sort((a, b) => {
            return (a.time as number) - (b.time as number);
          })
          .map((chat) => {
            return (
              <div
                key={chat.id}
                className={classNames(
                  chat.email === user?.email ? "justify-start" : "justify-end",
                  "flex min-h-12 items-end gap-2"
                )}
              >
                <div>
                  <Avatar name={chat.email === user?.email ? chat.sender : chat.receiverName} size="40" round={true} />
                </div>
                <div className={"text-black min-h-12 rounded-lg px-3 py-1 bg-white"}>
                  <div className="text-base font-bold">
                    {chat.email === user?.email ? chat.sender : chat.receiverName}
                  </div>
                  <div key={chat.id}>{chat.message}</div>
                </div>
              </div>
            );
          })}
        <div ref={ref} />
      </div>
    </div>
  );
};
export default forwardRef(ChatBox);
