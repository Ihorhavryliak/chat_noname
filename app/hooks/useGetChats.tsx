import { db } from "@/firebase/firebase";
import { User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { ChatType } from "../page";

type UseGetChatsType = {
  user: User | null | undefined;
  setChats: Dispatch<SetStateAction<ChatType[]>>;
  headerName: string;
};
const useGetChats = ({ user, setChats, headerName }: UseGetChatsType) => {
  useEffect(() => {
    if (user?.email) {
      onSnapshot(query(collection(db, "chats"), where("users", "array-contains-any", [user.email])), (snapshot) => {
        setChats(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            email: doc.data().email,
            isRead: doc.data().isRead,
            message: doc.data().message,
            sender: doc.data().sender,
            time: doc.data().time,
            chatName: doc.data().chatName,
            receiverName: headerName
          }))
        );
      });
    }
  }, [user?.email]);
  return <div>useGetChats</div>;
};

export default useGetChats;
