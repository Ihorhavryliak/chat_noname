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
              onClick={() => {
                onSelectChat(chat.id);
              }}
              className={/* classNames(chat.sender === user.displayName ? "" : "text-end",  */ "text-white"}
            >
              {chat.sender} - chat name
            </div>
          );
        })}
        {users.map((user) => {
          if (user.email !== userEmail) {
            return (
              <div
                onClick={() => {
                  handleSelectPrivatesChat(user.email);
                }}
                className={"text-white"}
              >
                {user.firstName}
              </div>
            );
          }
        })}
      </div>
    </aside>
  );
};

export default Aside;
