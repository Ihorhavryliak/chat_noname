import { ChatType, UserType } from "@/app/page";
import React from "react";

type AsideType = {
  onClick: () => void;
  chats: ChatType[];
  users: UserType[];
  userEmail: string;
  onSelectChat: (id: string) => void;
  handleSelectPrivatesChat: (email: string) => void;
};

const Aside = ({
  onClick,
  chats,
  users,
  userEmail,
  onSelectChat,
  handleSelectPrivatesChat,

}: AsideType) => {
  return (
    <aside className="bg-blue-900 max-w-80 w-full">
      <button onClick={onClick}>Creted chat</button>
      <div>
        {chats.map((chat) => {
          return (
            <div
            key={chat.id}
              onClick={() => {
                onSelectChat(chat.id);
              }}
              className={"text-white"}
            >
              {chat.chatName}
            </div>
          );
        })}
        {users.map((user) => {
          if (user.email !== userEmail) {
            return (
              <div
              key={user.id}
                onClick={() => {
                  handleSelectPrivatesChat(user.email);
                }}
                className={"text-white"}
              >
                {user.firstName}  {user.lastName}
                <div>
                {user.lastMessage} 
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
