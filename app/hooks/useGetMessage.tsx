import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Dispatch, SetStateAction, useEffect } from "react";
import { MessageType } from "../page";

type UseGetMessageType = {
  selectedChatId:  string
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  headerName: string;
  setSelectedChatPrivateId: Dispatch<SetStateAction<string[]>>;
};
const useGetMessage = ({ selectedChatId, setMessages, headerName, setSelectedChatPrivateId }: UseGetMessageType) => {
  useEffect(() => {
    if (selectedChatId.length > 0) {
      onSnapshot(query(collection(db, "messages"), where("chat_id", "==", selectedChatId)), (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            chat_id: doc.data().chat_id,
            id: doc.id,
            isRead: doc.data().isRead,
            message: doc.data().message,
            sender: doc.data().sender,
            time: doc.data().time,
            email: doc.data().email,
            receiverName: headerName
          }))
        );
      });
      setSelectedChatPrivateId([]);
    }
  }, [selectedChatId, headerName]);
};

export default useGetMessage;
