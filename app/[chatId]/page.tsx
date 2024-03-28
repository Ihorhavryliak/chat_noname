'use client'
import { redirect } from "next/navigation";
type ParamsType = {
  params: { chatId: string };
};

const ChatLink = ({ params }: ParamsType) => {
  const chatId = params.chatId;
  sessionStorage.setItem("chatId", chatId);
  return redirect(`/`);
};

export default ChatLink;
