"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import Avatar from "react-avatar";
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
  const [setHeaderName, setSetHeaderName] = useState("");
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
       // behavior: "smooth",
       // block: "start"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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
          setSelectedChatPrivateId(response[0]?.id);
        } else if (responseAnother && responseAnother.length) {
          setSelectedChatPrivateId(responseAnother[0]?.id);
        } else {
          try {
            const responseRef = await addDoc(collection(db, `chat_privates`), {
              email: user?.email,
              receiverEmail: receiverEmail,
              lastMessage: textareaText,
              sender: user?.displayName,
              time: serverTimestamp(),
              isRead: false
            });
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
          <div className="flex">
            <Aside
              handleSelectPrivatesChat={(email, name) => {
                scrollToBottom();
                setSetHeaderName(name);
                setSelectedChatPrivateId("");
                setMessages([]);
                setSelectedChatId("");
                handleSelectPrivateChat(email);
              }}
              onSelectChat={(id, name) => {
                if (id !== selectedChatId) {
                  scrollToBottom();
                  setSetHeaderName(name);
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
            <div className=" h-screen w-full">
              <Header setHeaderName={setHeaderName} />
              <div className="pl-10  flex flex-col justify-between h-[calc(100%-56px)]">
                <div className=" overflow-auto pr-10">
                  <div className="flex flex-col  gap-3 mt-3 pb-8">
                    {messages
                      ?.sort((a, b) => a.time - b.time)
                      .map((chat) => {
                        debugger;
                        return (
                          <div
                            className={classNames(
                              chat.email === user.email || chat.receiverEmail === user.email
                                ? "justify-start"
                                : "justify-end",
                              "flex min-h-12 items-center gap-2"
                            )}
                          >
                            <div>
                              <Avatar name={chat.id} size="40" round={true} />
                            </div>
                            <div key={chat.id} className={"text-black bg-white min-h-12 rounded-md p-3"}>
                              {chat.message}
                            </div>
                          </div>
                        );
                      })}
                    <div ref={lastMessageDiv} />
                  </div>
                </div>
                {(selectedChatPrivateId || selectedChatId) && (
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

async function SignIn() {
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const isEmail = onSnapshot(
        query(collection(db, "users"), where("email", "==", res.user.email)),
        (snapshot) => snapshot
      );
      if (!isEmail?.length) {
        await addDoc(collection(db, `users`), {
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
