import { ChatType, UserType } from "@/app/page";
import React from "react";
import Avatar from "react-avatar";

type AsideType = {
  onClick: () => void;
  chats: ChatType[];
  users: UserType[];
  userEmail: string;
  onSelectChat: (id: string, name: string) => void;
  handleSelectPrivatesChat: (email: string, name: string) => void;
};

const Aside = ({ onClick, chats, users, userEmail, onSelectChat, handleSelectPrivatesChat }: AsideType) => {
  return (
    <aside className="bg-white max-w-[404px] w-full relative overflow-hidden">
      <button
        onClick={onClick}
        className="bg-gray-300 p-2 rounded-md mx-4 my-4 cursor-pointer hover:bg-gray-400 hover:text-white"
      >
        |||
      </button>
      <div className="p-4 overflow-scroll max-h-[calc(100vh-72px)] h-full">
        {chats.map((chat) => {
          return (
            <div
              key={chat.id}
              onClick={() => {
                onSelectChat(chat.id, chat.chatName);
              }}
              className="transition-all flex gap-4 items-center cursor-pointer text-black p-2 hover:bg-custom-blue-100 rounded-lg hover:text-white"
            >
              <Avatar name={chat.chatName} size="70" round={true} title="" />
              <div>
                <div className="font-medium">{chat.chatName}</div>
                <div className=" text-base font-medium">some message</div>
              </div>
            </div>
          );
        })}
        {users.map((user) => {
          if (user.email !== userEmail) {
            return (
              <div
                onClick={() => {
                  handleSelectPrivatesChat(user.email, user.firstName);
                }}
                className="transition-all flex gap-4 items-center cursor-pointer text-black p-2 hover:bg-custom-blue-100 rounded-lg  hover:text-white"
              >
                <div>
                  <Avatar name={user.firstName} size="70" round={true} />
                </div>

                <div>
                  <div className="font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className=" text-base font-medium">some message</div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </aside>
  );
};

export default Aside;
