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

import Aside from "@/components/Aside/Aside";
import Header from "@/components/Header/Header";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import useCreateChatName from "./hooks/useCreateChatName";
import SignIn from "@/components/SignIn/SignIn";
import useHandleSelectPrivateChat from "./hooks/useHandleSelectPrivateChat";
import useHandleCreateChat from "./hooks/useHandleCreateChat";
import useGetUsers from "./hooks/useGetUsers";
import useGetChats from "./hooks/useGetChats";
import useGetMessage from "./hooks/useGetMessage";
import ModalIsOpenLinkForChanel from "@/components/Modal/ModalIsOpenLinkForChanel";
import TextAreaMessage from "@/components/TextAreaMessage.tsx/TextAreaMessage";
import ChatBox from "@/components/ChatBox/ChatBox";
import Loader from "@/components/Loader/Loader";

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
  const [user, loading] = useAuthState(auth);
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

  if (loading) {
    return <Loader loading={loading} />;
  }
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
                <ChatBox messages={messages} user={user} ref={lastMessageDiv} />
                {(selectedChatPrivateId.length || selectedChatId) && (
                  <TextAreaMessage
                    scrollToBottom={scrollToBottom}
                    textareaText={textareaText}
                    setTextareaText={setTextareaText}
                    selectedChatId={selectedChatId}
                    emailReceiver={emailReceiver}
                    headerName={headerName}
                    user={user}
                    selectedChatPrivateId={selectedChatPrivateId}
                  />
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

      <ModalIsOpenLinkForChanel
        setIsOpenLinkForChanel={setIsOpenLinkForChanel}
        isOpenLinkForChanel={isOpenLinkForChanel}
        linkForChanel={linkForChanel}
      />
    </main>
  );
}
