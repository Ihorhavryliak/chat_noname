"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { auth, db } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import classNames from "@/utils/classNames";

import Aside from "@/components/Aside/Aside";
import Header from "@/components/Header/Header";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import useCreateChatName from "./hooks/useCreateChatName";
import Avatar from "react-avatar";
import SignIn from "@/components/SignIn/SignIn";
import useHandleSelectPrivateChat from "./hooks/useHandleSelectPrivateChat";
import useHandleCreateChat from "./hooks/useHandleCreateChat";
import useGetUsers from "./hooks/useGetUsers";
import useGetChats from "./hooks/useGetChats";
import useGetMessage from "./hooks/useGetMessage";

export type UserType = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  password?: string;
  lastMessage?: string;
};
export type ChatType = {
  id: string;
  email: string;
  isRead: boolean;
  message: string;
  sender: string;
  time: string;
  chatName: string;
  receiverName: string;
};
export type MessageType = {
  id: string;
  isRead: boolean;
  message: string;
  sender: string;
  time: number | string;
  receiverEmail?: string;
  receiver?: string;
  email?: string;
  receiverName: string;
};

export default function Home() {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([] as UserType[]);
  const [chats, setChats] = useState([] as ChatType[]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [selectedChatPrivateId, setSelectedChatPrivateId] = useState([] as string[]);
  const [messages, setMessages] = useState([] as MessageType[]);
  const lastMessageDiv = useRef(null);
  const [textareaText, setTextareaText] = useState("");
  const [emailReceiver, setEmailReceiver] = useState("");
  const [open, setOpen] = useState(false);
  const [linkForChanel, setLinkForChanel] = useState("");
  const [isOpenLinkForChanel, setIsOpenLinkForChanel] = useState(false);
  const [headerName, setSetHeaderName] = useState("");

  const { handleCreateChat } = useHandleCreateChat({
    user,
    textareaText,
    setSelectedChatId,
    setIsOpenLinkForChanel,
    setTextareaText,
    setLinkForChanel
  });
  const { dataInput, error, handleSubmit, onSubmit, register, watch } = useCreateChatName({ handleCreateChat });
  useGetChats({ user, setChats, headerName });
  useGetUsers({ user, setUsers });

  useGetMessage({ headerName, selectedChatId, setMessages, setSelectedChatPrivateId });

  const { handleSelectPrivateChat } = useHandleSelectPrivateChat({
    textareaText,
    setTextareaText,
    selectedChatPrivateId,
    setMessages,
    headerName,
    setEmailReceiver,
    user,
    setSelectedChatPrivateId
  });

  const scrollToBottom = () => {
    if (lastMessageDiv && lastMessageDiv.current) {
      const currentElement = lastMessageDiv.current as HTMLElement;
      currentElement.scrollIntoView({});
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <main className="max-h-[calc(100%-56px)] overflow-hidden h-full box-content">
      <div>
        {!user ? (
          <SignIn />
        ) : (
          <div className="flex">
            <Aside
              handleSelectPrivatesChat={(email, name) => {
                scrollToBottom();
                setSetHeaderName(name);
                setSelectedChatPrivateId([]);
                setMessages([]);
                setSelectedChatId("");
                handleSelectPrivateChat(email);
              }}
              onSelectChat={(id, name) => {
                if (id !== selectedChatId) {
                  scrollToBottom();
                  setSetHeaderName(name);
                  setSelectedChatPrivateId([]);
                  setMessages([]);
                  setSelectedChatId(id);
                }
              }}
              chats={chats}
              users={users}
              userEmail={user.email || ""}
              onClick={() => setOpen((prev) => !prev)}
            />
            <div className=" h-screen w-full">
              <Header headerName={headerName} />
              <div className="pl-10  flex flex-col justify-between h-[calc(100%-56px)]">
                <div className=" overflow-auto pr-10">
                  <div className="flex flex-col  gap-3 mt-3 pb-8">
                    {messages
                      ?.sort((a, b) => {
                        return (a.time as number) - (b.time as number);
                      })
                      .map((chat) => {
                        return (
                          <div
                            className={classNames(
                              chat.email === user.email ? "justify-start" : "justify-end",
                              "flex min-h-12 items-end gap-2"
                            )}
                          >
                            <div>
                              <Avatar
                                name={chat.email === user.email ? chat.sender : chat.receiverName}
                                size="40"
                                round={true}
                              />
                            </div>
                            <div className={"text-black min-h-12 rounded-lg px-3 py-1 bg-white"}>
                              <div className="text-base font-bold">
                                {chat.email === user.email ? chat.sender : chat.receiverName}
                              </div>
                              <div key={chat.id}>{chat.message}</div>
                            </div>
                          </div>
                        );
                      })}
                    <div ref={lastMessageDiv} />
                  </div>
                </div>
                {(selectedChatPrivateId.length || selectedChatId) && (
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
                            email: user.email,
                            chat_id: selectedChatId,
                            isRead: [user.email],
                            message: textareaText,
                            sender: user.displayName,
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
                            email: user.email,
                            chat_id: selectedChatPrivateId[0],
                            isRead: [user.email],
                            message: textareaText,
                            sender: user.displayName,
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal open={open} setOpen={() => setOpen((prev) => !prev)}>
        <>
          {dataInput.map((input, index) => (
            <Fragment key={`${index}chatNameKey`}>
              <Input
                value={watch(input.name as "chatName")}
                label={input.label}
                type={input.type}
                item={input}
                register={register(input.name as "chatName")}
                error={error[input.name]?.message}
              />
            </Fragment>
          ))}
          <div className="flex justify-end">
            <button
              className="transition-all hover:bg-blue-500 bg-custom-blue-100 h-[54px] min-w-[54px] rounded-full text-2xl text-white justify-end items-center mt-4 "
              onClick={() => {
                handleSubmit(onSubmit)();
                setOpen((prev) => !prev);
              }}
            >
              ▶
            </button>
          </div>
        </>
      </Modal>

      <Modal open={isOpenLinkForChanel} setOpen={() => setIsOpenLinkForChanel((prev) => !prev)}>
        <>
          <div className="text-black">Link</div>
          <div className="text-black font-bold">
            {process.env.NEXT_PUBLIC_URL_SITE}
            {"/"}
            {linkForChanel}
          </div>

          <div className="flex justify-end">
            <button
              className="transition-all hover:bg-blue-500 bg-custom-blue-100 h-[54px] px-6  rounded-md text-2xl text-white justify-end items-center"
              onClick={() => {
                setIsOpenLinkForChanel((prev) => !prev);
              }}
            >
              Close
            </button>{" "}
          </div>
        </>
      </Modal>
    </main>
  );
}
