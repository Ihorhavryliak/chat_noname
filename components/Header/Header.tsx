import { auth } from "@/firebase/firebase";
import React from "react";

const Header = () => {
  return (
    <header>
      <div className="flex justify-between pb-6 border-b-2 border-gray-50">
     <div>App</div> 
      <button onClick={() => auth.signOut()}> Sign Out</button>
      </div>
    </header>
  );
};

export default Header;
