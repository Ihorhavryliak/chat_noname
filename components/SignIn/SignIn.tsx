import { auth, db, googleAuthProvider } from "@/firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { addDoc, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import useLogin from "./useLogin";

const SignIn = () => {
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      useLogin({ displayName: res.user.displayName, email: res.user.email });
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
