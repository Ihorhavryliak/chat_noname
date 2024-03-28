import { useForm, SubmitHandler } from "react-hook-form";

export type ErrorUserFormType = {
  [key: string]: { message: string };
};
export type InputFieldNameType = {
  chatName?: string;
};
export type InputFieldNameKeyType = keyof InputFieldNameType;

export type DataInputType = {
  name: string;
};
type UseCreateChatNameType = {
  handleCreateChat: (chatName: string) => void;
};
const useCreateChatName = ({ handleCreateChat }: UseCreateChatNameType) => {
  const {
    handleSubmit,
    formState: { errors },
    register,
    watch
  } = useForm({
    defaultValues: {
      chatName: ""
    }
  });
  const errorData = errors as ErrorUserFormType;

  const onSubmit: SubmitHandler<InputFieldNameType> = (data) => {
    handleCreateChat(data.chatName || "");
  };

  const dataInput = [
    {
      name: "chatName",
      type: "text",
      label: "Chat name",
      placeholder: "Chat name"
    }
  ];
  return {
    dataInput,
    register,
    handleSubmit,
    error: errorData,
    onSubmit,
    watch
  };
};

export default useCreateChatName;
