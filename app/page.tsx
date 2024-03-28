"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { auth, db, googleAuthProvider } from "@/firebase/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
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
};
export type MessageType = {
  id: string;
  isRead: boolean;
  message: string;
  sender: string;
  time: string;
  receiverEmail?: string;
  receiver?: string;
  email?: string;
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
  const [emailReceiver, setEmailReceiver] = useState("");
  const [open, setOpen] = useState(false);
  const [linkForChanel, setLinkForChanel] = useState("");
  const [isOpenLinkForChanel, setIsOpenLinkForChanel] = useState(false);

  console.log(messages, "messages>>");
  console.log(selectedChatId, "selectedChatId>>");
  console.log(selectedChatPrivateId, "selectedChatPrivateId>>");
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
  }, [auth]);
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
    [user, textareaText]
  );

  const { dataInput, error, handleSubmit, onSubmit, register, watch } = useCreateChatName({ handleCreateChat });
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
            chatName: doc.data().chatName
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
            id: doc.id,
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
            email: doc.data().email
          }))
        );
      });
      setSelectedChatPrivateId("");
    }
  }, [selectedChatId]);
  useEffect(() => {
    if (selectedChatPrivateId?.length > 0) {
      onSnapshot(
        query(collection(db, "message_privates"), where("chat_id", "==", selectedChatPrivateId)),
        (snapshot) => {
          setMessages(
            snapshot.docs.map((doc) => ({
              chat_id: doc.data().chat_id,
              id: doc.id,
              isRead: doc.data().isRead,
              message: doc.data().message,
              sender: doc.data().sender,
              time: doc.data().time,
              email: doc.data().email
            }))
          );
        }
      );
    }
  }, [selectedChatPrivateId]);

  const scrollToBottom = () => {
    if (lastMessageDiv && lastMessageDiv.current) {
      const currentElement = lastMessageDiv.current as HTMLElement;
      currentElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

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
        debugger;
        if (response && response.length) {
          setSelectedChatPrivateId(response[0]?.id);
        } else if (responseAnother && responseAnother.length) {
          setSelectedChatPrivateId(responseAnother[0]?.id);
        } else {
          try {
            debugger;
            const responseRef = await addDoc(collection(db, `chat_privates`), {
              email: user?.email,
              receiverEmail: emailReceiver,
              lastMessage: textareaText,
              sender: user?.displayName,
              time: serverTimestamp(),
              isRead: false
            });
            debugger;
            setSelectedChatPrivateId(responseRef?.id);
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
              onSelectChat={(id) => {
                if (id !== selectedChatId) {
                  setSelectedChatPrivateId("");
                  setMessages([]);
                  setSelectedChatId(id);
                }
              }}
              chats={chats}
              users={users}
              userEmail={user.email || ""}
              onClick={() => setOpen((prev) => !prev)}
            />
            <div className="bg-gray-800 h-screen w-full p-6">
              <Header />
              <div className="flex flex-col justify-between h-[calc(100%-26px)]">
                <div className="bg-gray-500">
                  <div>
                    {messages
                      /* ?.sort((a, b) => a.time - b.time) */
                      .map((chat) => {
                        debugger;
                        return (
                          <div
                            key={chat.id}
                            className={classNames(
                              chat.email === user.email || chat.receiverEmail === user.email
                                ? ""
                                : "text-end text-red-900",
                              "text-red-300"
                            )}
                          >
                            {chat.message} {chat.email}
                          </div>
                        );
                      })}
                  </div>
                </div>
                {(selectedChatPrivateId || selectedChatId) && (
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
                          addDoc(collection(db, "messages"), {
                            email: user.email,
                            chat_id: selectedChatId,
                            isRead: [user.email],
                            message: textareaText,
                            sender: user.displayName,
                            time: serverTimestamp()
                          })
                            .then(() => {
                              setTextareaText("");
                            })
                            .catch((err) => alert(err.message));
                        } else if (selectedChatPrivateId) {
                          addDoc(collection(db, "message_privates"), {
                            email: user.email,
                            chat_id: selectedChatPrivateId,
                            isRead: [user.email],
                            message: textareaText,
                            sender: user.displayName,
                            time: serverTimestamp()
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
          <button
            onClick={() => {
              handleSubmit(onSubmit)();
              setOpen((prev) => !prev);
            }}
            className="text-black"
          >
            send
          </button>
        </>
      </Modal>

      <Modal open={isOpenLinkForChanel} setOpen={() => setIsOpenLinkForChanel((prev) => !prev)}>
        <>
          <div className="text-black">Link</div>
          <div className="text-black">
            {" "}
            {"/"}
            {linkForChanel}
          </div>
          <button
            onClick={() => {
              setIsOpenLinkForChanel((prev) => !prev);
            }}
            className="text-black"
          >
            Close
          </button>
        </>
      </Modal>
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
