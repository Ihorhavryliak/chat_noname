import { db } from "@/firebase/firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

type UseLoginType = {
  email?: string | null;
  displayName: string | null;
};
const useLogin = async ({ email, displayName }: UseLoginType) => {
  const q = query(collection(db, "users"), where("email", "==", email));
  const response = await getDocs(q)
    .then((snapshot) => {
      const result = snapshot.docs.map((doc) => ({
        id: doc
      }));
      return result;
    })
    .catch((error) => {
      console.error("Error getting documents: ", error);
    });

  if (!response?.length) {
    await addDoc(collection(db, `users`), {
      email: email,
      firstName: displayName
    }).catch((err) => alert(err.message));
  }
};

export default useLogin;
