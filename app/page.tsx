"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useRef, useState } from "react";
import { auth, db, googleAuthProvider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import classNames from "@/utils/classNames";

type ChatsType = {
  id: string;
  message: string;
  time: string;
  sender: string;
};
export default function Home() {
  const [user] = useAuthState(auth);
  const [textareaText, setTextareaText] = useState("");
  const [chats, setChats] = useState([] as ChatsType[]);
  const lastMessageDiv = useRef(null);

  const [chatss, setChatss] = useState([] as any[]);
  console.log(chatss, '>><><>')
  useEffect(() => {
    /* const unsubscribeChats = onSnapshot(
      query(collection(db, "chats"), orderBy("time", "asc")),
      (snapshot) => {
        setChats(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            message: doc.data().message,
            time: doc.data().time,
            sender: doc.data().sender,
          }))
        );
      }
    ); */

    const unsubscribeChatss = onSnapshot(
      query(
       collection(db, "users_chats"),
    where("user_id", "==", "users.id"),
    where("chat_id", "==", "chats.id")
      ),
      (snapshot) => {
        console.log(snapshot, '>><><>')
        debugger
        setChatss(
          snapshot.docs
        /*   snapshot.docs.map((doc) => ({
            id: doc.id,
            message: doc.data().message,
            time: doc.data().time,
            sender: doc.data().sender,
          })) */
        );
      }
    );

    return () => {
     /*  unsubscribeChats(); */
      unsubscribeChatss();
    };
  }, [user]);

  const scrollToBottom = () => {
    if (lastMessageDiv && lastMessageDiv.current) {
      const currentElement = lastMessageDiv.current as HTMLElement;
      currentElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 container">
      <header></header>
      {!user ? (
        <SignIn />
      ) : (
        <>
          <button onClick={() => auth.signOut()}> Sign Out</button>
          <div>
            <div className="bg-white h-80">
              <div>
                {chats.map((chat) => {
                  return (
                    <div
                      className={classNames(
                        chat.sender === user.displayName ? "" : "text-end",
                        "text-black"
                      )}
                    >
                      {chat.message}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex" ref={lastMessageDiv}>
              <textarea
                className="text-black border"
                value={textareaText}
                onChange={(e) => setTextareaText(e.target.value)}
              />
            </div>
            <button
              onClick={(e) => {
                setTextareaText("");
                e.preventDefault();
                addDoc(collection(db, `chats`), {
                  message: textareaText,
                  sender: user?.displayName,
                  time: serverTimestamp(),
                })
                  .then(() => setTextareaText(""))
                  .catch((err) => alert(err.message));
                scrollToBottom();
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

/* function ChatRoom() {
  const dummy = useRef(null);
  const messagesRef = collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          🕊️
        </button>
      </form>
    </>
  );
}
 */
function ChatMessage(props: any) {
  const { text, uid, photoURL } = props.message;

  const messageClass =
    ""; /* uid === auth.currentUser.uid ? "sent" : "received"; */

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}
