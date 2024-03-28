"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth, db, googleAuthProvider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";
import classNames from "@/utils/classNames";
import { v4 as uuidv4 } from "uuid";
import Aside from "@/components/Aside/Aside";
import Header from "@/components/Header/Header";
export type UserType = {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  password?: string;
};
export type ChatType = {
  id: string;
  email: string;
  isRead: boolean;
  message: string;
  sender: string;
  timestamp: string;
};
export type MessageType = {
  id: string;
  isRead: boolean;
  message: string;
  sender: string;
  timestamp: string;
  receiverEmail?: string;
  receiver?: string;
};

export default function Home() {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([] as UserType[]);
  const [chats, setChats] = useState([] as ChatType[]);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [selectedChatPrivateId, setSelectedChatPrivateId] = useState("");
  const [messages, setMessages] = useState([] as MessageType[]);
  const lastMessageDiv = useRef(null);
  const [textareaText, setTextareaText] = useState("");
  const [isNotChat, setIsNotChat] = useState({ isGetChat: false, isGetChatReceiver: false });
  const [emailReceiver, setEmailReceiver] = useState("");

  useEffect(() => {
    if (user?.email) {
      onSnapshot(query(collection(db, "chats"), where("email", "==", user.email)), (snapshot) => {
        setChats(
          snapshot.docs.map((doc) => ({
            id: doc.data().id,
            email: doc.data().id,
            isRead: doc.data().id,
            message: doc.data().id,
            sender: doc.data().id,
            timestamp: doc.data().id
          }))
        );
      });
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      onSnapshot(query(collection(db, "users")), (snapshot) => {
        setUsers(
          snapshot.docs.map((doc) => ({
            id: doc.data().id,
            email: doc.data().email,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            password: doc.data().password
          }))
        );
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?.email && selectedChatId) {
      onSnapshot(query(collection(db, "messages"), where("chat_id", "==", selectedChatId)), (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            chat_id: doc.data().chat_id,
            id: doc.data().id,
            isRead: doc.data().isRead,
            message: doc.data().message,
            sender: doc.data().sender,
            timestamp: doc.data().timestamp
          }))
        );
      });
    }
  }, [user, selectedChatId]);
  useEffect(() => {
    debugger;
    if (user?.email && selectedChatPrivateId) {
      onSnapshot(
        query(collection(db, "message_privates"), where("chat_id", "==", selectedChatPrivateId)),
        (snapshot) => {
          setMessages(
            snapshot.docs.map((doc) => ({
              chat_id: doc.data().chat_id,
              id: doc.data().id,
              isRead: doc.data().isRead,
              message: doc.data().message,
              sender: doc.data().sender,
              timestamp: doc.data().timestamp
            }))
          );
        }
      );
    }
  }, [user, selectedChatPrivateId]);

  const scrollToBottom = () => {
    if (lastMessageDiv && lastMessageDiv.current) {
      const currentElement = lastMessageDiv.current as HTMLElement;
      currentElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };
  const handleCreateChat = useCallback(() => {
    try {
      addDoc(collection(db, `chats`), {
        id: uuidv4(),
        email: user?.email,
        lastMessage: textareaText,
        sender: user?.displayName,
        timestamp: serverTimestamp(),
        isRead: false
      }).then(() => setTextareaText(""));
    } catch (error) {
      console.log(error);
    }
  }, [user?.email]);

  const handleSelectPrivateChat = useCallback(
    (receiverEmail: string) => {
      try {
        setEmailReceiver(receiverEmail);
        const unsubscribe = onSnapshot(
          query(
            collection(db, "chat_privates"),
            where("receiverEmail", "==", user?.email),
            where("email", "==", receiverEmail)
          ),
          (snapshot) => {
            const result = snapshot.docs.map((doc) => ({
              id: doc.data().id
            }));

            if (result[0]?.id) {
              setSelectedChatPrivateId(result[0].id);
              debugger;
            } else {
              setIsNotChat((prev) => {
                return { ...prev, isGetChat: true };
              });
            }
          }
        );

        const unsubscribeReceiver = onSnapshot(
          query(
            collection(db, "chat_privates"),
            where("receiverEmail", "==", receiverEmail),
            where("email", "==", user?.email)
          ),
          (snapshot) => {
            const result = snapshot.docs.map((doc) => ({
              id: doc.data().id
            }));

            if (result[0]?.id) {
              debugger;
              setSelectedChatPrivateId(result[0].id);
            } else {
              setIsNotChat((prev) => {
                return { ...prev, isGetChatReceiver: true };
              });
            }
          }
        );

        return () => {
          unsubscribeReceiver();
          unsubscribe();
        };
      } catch (error) {
        console.log(error);
      }
    },
    [user?.email, setIsNotChat]
  );

  useEffect(() => {
    if (isNotChat.isGetChat && isNotChat.isGetChatReceiver && emailReceiver) {
      const chatId = uuidv4();
      addDoc(collection(db, `chat_privates`), {
        id: chatId,
        email: user?.email,
        receiverEmail: emailReceiver,
        lastMessage: textareaText,
        sender: user?.displayName,
        timestamp: serverTimestamp(),
        isRead: false
      }).then(() => {
        setSelectedChatPrivateId(chatId);
        setTextareaText("");
      });
    }
    return () => {};
  }, [isNotChat, emailReceiver, user?.email, textareaText]);
  useEffect(() => {
    return () => {
      setIsNotChat({ isGetChat: false, isGetChatReceiver: false });
    };
  }, [setIsNotChat]);

  return (
    <main>
      <div>
        {!user ? (
          <SignIn />
        ) : (
          <div className="flex gap-8">
            <Aside
              handleSelectPrivatesChat={(email) => {
                setSelectedChatPrivateId("");
                setMessages([]);
                setSelectedChatId("");
                handleSelectPrivateChat(email);
              }}
              onSelectChat={(id) => setSelectedChatId(id)}
              chats={chats}
              users={users}
              userEmail={user.email || ""}
              onClick={() => handleCreateChat()}
            />
            <div className="bg-gray-800 h-screen w-full p-6">
              <Header />
              <div className="flex flex-col justify-between h-[calc(100%-26px)]">
                <div className="bg-gray-500">
                  <div>
                    {messages.map((chat) => {
                      return (
                        <div
                          className={classNames(
                            chat.message === user.email ? "" : "text-end text-red-300",
                            "text-red-300"
                          )}
                        >
                          {chat.message}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between" ref={lastMessageDiv}>
                  <textarea
                    className="text-black border"
                    value={textareaText}
                    onChange={(e) => setTextareaText(e.target.value)}
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (selectedChatId) {
                        addDoc(collection(db, `messages`), {
                          chat_id: selectedChatId,
                          id: uuidv4(),
                          isRead: false,
                          message: textareaText,
                          sender: user.displayName,
                          timestamp: serverTimestamp()
                        })
                          .then(() => {
                            setTextareaText("");
                          })
                          .catch((err) => alert(err.message));
                      } else if (selectedChatPrivateId) {
                        console.log(selectedChatPrivateId, "selectedChatPrivateId.>");
                        addDoc(collection(db, `message_privates`), {
                          chat_id: selectedChatPrivateId,
                          id: uuidv4(),
                          isRead: false,
                          message: textareaText,
                          sender: user.displayName,
                          timestamp: serverTimestamp()
                        })
                          .then(() => {
                            setTextareaText("");
                          })
                          .catch((err) => alert(err.message));
                      }

                      scrollToBottom();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const isEmail = onSnapshot(
        query(collection(db, "users"), where("email", "==", res.user.email)),
        (snapshot) => snapshot
      );
      if (!isEmail) {
        addDoc(collection(db, `users`), {
          id: uuidv4(),
          email: res.user.email,
          firstName: res.user.displayName
        }).catch((err) => alert(err.message));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
}
