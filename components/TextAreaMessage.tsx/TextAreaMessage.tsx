import { db } from "@/firebase/firebase";
import classNames from "@/utils/classNames";
import { User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { Dispatch, SetStateAction } from "react";

type TextAreaMessageType = {
  scrollToBottom: () => void;
  textareaText: string;
  setTextareaText: Dispatch<SetStateAction<string>>;
  selectedChatId: string;
  emailReceiver: string;
  headerName: string;
  user: User | null | undefined;
  selectedChatPrivateId: string[];
};
const TextAreaMessage = ({
  scrollToBottom,
  textareaText,
  setTextareaText,
  selectedChatId,
  emailReceiver,
  headerName,
  user,
  selectedChatPrivateId
}: TextAreaMessageType) => {
  return (
    <div className="flex justify-between gap-4 pr-10">
      <div className="relative w-full">
        <textarea
          placeholder="Message"
          className={classNames(
            "pr-4 py-2 pl-5 pt-3 font-roboto bg-white w-full rounded-md text-base outline-none placeholder:text-custom-gray-200 border border-custom-gray-100 h-[54px]"
          )}
          value={textareaText}
          onChange={(e) => setTextareaText(e.target.value)}
        />{" "}
      </div>
      <button
        className="transition-all hover:bg-blue-500 bg-custom-blue-100 h-[54px] min-w-[54px] rounded-full text-2xl text-white justify-end items-center"
        onClick={(e) => {
          e.preventDefault();

          if (selectedChatId) {
            addDoc(collection(db, "messages"), {
              email: user?.email,
              chat_id: selectedChatId,
              isRead: [user?.email],
              message: textareaText,
              sender: user?.displayName,
              time: serverTimestamp(),
              receiverName: headerName,
              receiverEmail: emailReceiver
            })
              .then(() => {
                setTextareaText("");
              })
              .catch((err) => alert(err.message));
          } else if (selectedChatPrivateId) {
            debugger;
            addDoc(collection(db, "message_privates"), {
              email: user?.email,
              chat_id: selectedChatPrivateId[0],
              isRead: [user?.email],
              message: textareaText,
              sender: user?.displayName,
              time: serverTimestamp(),
              receiverEmail: emailReceiver
            })
              .then(() => {
                setTextareaText("");
              })
              .catch((err) => alert(err.message));
          }
          scrollToBottom();
        }}
      >
        ▶
      </button>
    </div>
  );
};

export default TextAreaMessage;
