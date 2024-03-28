import { db } from "@/firebase/firebase";
import { User } from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Dispatch, SetStateAction, useEffect } from "react";
import { UserType } from "../page";
type useGetUsersType = {
  user: User | null | undefined;
  setUsers: Dispatch<SetStateAction<UserType[]>>;
};
const useGetUsers = ({ user, setUsers }: useGetUsersType) => {
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
  }, [user, setUsers]);
};

export default useGetUsers;
