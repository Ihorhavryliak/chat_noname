import { auth } from "@/firebase/firebase";
import React from "react";

type HeaderType = {
  headerName: string;
};
const Header = ({ headerName }: HeaderType) => {
  return (
    <header>
      <div className="flex justify-between py-2 border  shadow-sm border-gray-200 bg-white px-4 h-14 items-center">
        <div className="text-bold text-base">{headerName || 'App'} </div>
        <button onClick={() => auth.signOut()}> Sign Out</button>
      </div>
    </header>
  );
};

export default Header;
