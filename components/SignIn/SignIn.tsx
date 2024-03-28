import { auth, db, googleAuthProvider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { addDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";

const SignIn = () => {
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const q = query(collection(db, "chat_privates"), where("email", "==", res.user.email));
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

      if (!response?.length) {
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
    <div className="flex items-center justify-center mt-60">
      <button className="sign-in p-10 bg-white rounded-xl hover:bg-blue-500 transition-all" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
};

export default SignIn;
