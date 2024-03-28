import { db } from "@/firebase/firebase";
import { addDoc, collection, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import React, { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { MessageType } from "../page";
import { User } from "firebase/auth";

type UseHandleSelectPrivateChatType = {
  textareaText: string;
  setTextareaText: (val: string) => void;
  selectedChatPrivateId: string[];
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  headerName: string;
  setEmailReceiver: (val: string) => void;
  user: User | null | undefined;
  setSelectedChatPrivateId:  Dispatch<SetStateAction<string[]>>
};

const useHandleSelectPrivateChat = ({
  textareaText,
  setTextareaText,
  selectedChatPrivateId,
  setMessages,
  headerName,
  setEmailReceiver,
  user,
  setSelectedChatPrivateId
}: UseHandleSelectPrivateChatType) => {
  useEffect(() => {
    if (selectedChatPrivateId?.length > 0) {
      onSnapshot(
        query(collection(db, "message_privates"), where("chat_id", "==", selectedChatPrivateId[0])),
        (snapshot) => {
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
        }
      );
    }
  }, [selectedChatPrivateId, headerName]);
  const handleSelectPrivateChat = useCallback(
    async (receiverEmail: string) => {
      try {
        setEmailReceiver(receiverEmail);

        const q = query(
          collection(db, "chat_privates"),
          where("receiverEmail", "==", user?.email),
          where("email", "==", receiverEmail)
        );

        const q2 = query(
          collection(db, "chat_privates"),
          where("receiverEmail", "==", receiverEmail),
          where("email", "==", user?.email)
        );
        // Execute the query once to get a snapshot of the result set
        const response = await getDocs(q)
          .then((snapshot) => {
            const result = snapshot.docs.map((doc) => ({
              id: doc.id
            }));
            return result;
          })
          .catch((error) => {
            console.error("Error getting documents: ", error);
          });
        // Execute the query once to get a snapshot of the result set
        const responseAnother = await getDocs(q2)
          .then((snapshot) => {
            const result = snapshot.docs.map((doc) => ({
              id: doc.id
            }));
            return result;
          })
          .catch((error) => {
            console.error("Error getting documents: ", error);
          });

        if (response && response.length) {
          setSelectedChatPrivateId((prev) => {
            return [...prev, response[0]?.id];
          });
        } else if (responseAnother && responseAnother.length) {
          setSelectedChatPrivateId((prev) => {
            return [...prev, responseAnother[0]?.id];
          });
        } else {
          try {
            debugger;
            const responseRef = await addDoc(collection(db, `chat_privates`), {
              email: user?.email,
              receiverEmail: receiverEmail,
              lastMessage: textareaText,
              sender: user?.displayName,
              time: serverTimestamp(),
              isRead: false
            });
            setSelectedChatPrivateId((prev) => {
              return [...prev, responseRef?.id];
            });
            setTextareaText("");
          } catch (error) {
            alert(error);
          }
        }
        return () => {};
      } catch (error) {
        console.log(error);
      }
    },
    [user?.email]
  );

  return {handleSelectPrivateChat};
};

export default useHandleSelectPrivateChat;
