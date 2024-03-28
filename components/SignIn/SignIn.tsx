import { auth, db, googleAuthProvider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { addDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";

const SignIn = () => {
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);

      const q = query(collection(db, "chat_privates"), where("email", "==", res.user.email));

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
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  );
};

export default SignIn;
