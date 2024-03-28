import classNames from "@/utils/classNames";
import { UseFormRegisterReturn } from "react-hook-form";

type InputType = {
  item: { [key: string]: string };
  error?: string;
  label?: string;
  type?: string;
  phone?: string;
  register: UseFormRegisterReturn;
  value: string;
};

const Input = ({ error, label, type = "text", phone, register, value }: InputType) => {
  return (
    <div className="relative">
      <div className="relative">
        {label && (
          <div className="py-2">
            <label className={classNames(error ? "text-gray-800" : "text-gray-800", "text-base")}>{label}</label>
          </div>
        )}
        <input
          type={type}
          className={classNames(
            error ? "border-red-100 border-2" : "border-gray-200 border ",
            value ? "text-black" : "text-black",
            "w-full h-[54px] py-3.5 ps-4 rounded focus:outline-none peer [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
          {...register}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
      </div>
      {error && <div className="text-red-500 text-xs leading-[117%] ms-4 mt-1 -bottom-[18px] absolute">{error}</div>}
    </div>
  );
};

export default Input;
