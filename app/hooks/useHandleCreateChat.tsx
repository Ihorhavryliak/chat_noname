import { auth, db } from "@/firebase/firebase";
import { User, onAuthStateChanged } from "firebase/auth";
import { addDoc, arrayUnion, collection, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";

type UseHandleCreateChatType = {
  textareaText: string;
  setTextareaText: (val: string) => void;
  user: User | null | undefined;
  setSelectedChatId: Dispatch<SetStateAction<string>>
  setIsOpenLinkForChanel: Dispatch<SetStateAction<boolean>>;
  setLinkForChanel: Dispatch<SetStateAction<string>>;
};

const useHandleCreateChat = ({
  user,
  textareaText,
  setSelectedChatId,
  setIsOpenLinkForChanel,
  setTextareaText,
  setLinkForChanel
}: UseHandleCreateChatType) => {
  useEffect(() => {
    const listener = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        const chatId = sessionStorage.getItem("chatId");
        if (chatId) {
          const fetch = async () => {
            const responseUser = await getDoc(doc(db, "chats", chatId)).then((docSnapshot) => {
              const data = docSnapshot.data();
              return data;
            });

            const email = user?.email as string;
            const userEmail = responseUser?.users || "";

            if (user?.email && !userEmail?.includes(email) && user?.email) {
              const newUsers = arrayUnion(...[...userEmail, user?.email]);
              await updateDoc(doc(db, "chats", chatId), {
                users: newUsers
              });
            }
          };
          fetch();
          setSelectedChatId(chatId);
          sessionStorage.removeItem("chatId");
        }
      }
    });
    return () => {
      listener();
    };
  }, [ setSelectedChatId]);
  const handleCreateChat = useCallback(
    async (chatName: string) => {
      try {
        const docRef = await addDoc(collection(db, "chats"), {
          chatName: chatName,
          email: user?.email,
          lastMessage: textareaText,
          sender: user?.displayName,
          time: serverTimestamp(),
          isRead: false,
          users: [user?.email]
        });
        if (docRef) {
          setIsOpenLinkForChanel(true);
          setTextareaText("");
          setLinkForChanel(docRef.id);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [user, textareaText,  setIsOpenLinkForChanel, setLinkForChanel, setTextareaText]
  );

  return { handleCreateChat };
};

export default useHandleCreateChat;
