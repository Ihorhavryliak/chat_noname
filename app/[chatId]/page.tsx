'use client'
import { useEffect } from 'react';
import { redirect } from "next/navigation";

type ParamsType = {
  params: { chatId: string };
};

const ChatLink = ({ params }: ParamsType) => {
  const chatId = params.chatId;

  useEffect(() => {
    sessionStorage.setItem("chatId", chatId);
    redirect(`/`);
  }, [chatId]); 

  return null; 
};

export default ChatLink;
