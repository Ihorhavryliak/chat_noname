import React, { Dispatch, SetStateAction } from "react";
import Modal from "./Modal";

type ModalIsOpenLinkForChanelType = {
  isOpenLinkForChanel: boolean;
  setIsOpenLinkForChanel: Dispatch<SetStateAction<boolean>>;
  linkForChanel: string;
};
const ModalIsOpenLinkForChanel = ({
  isOpenLinkForChanel,
  setIsOpenLinkForChanel,
  linkForChanel
}: ModalIsOpenLinkForChanelType) => {
  return (
    <Modal open={isOpenLinkForChanel} setOpen={() => setIsOpenLinkForChanel((prev) => !prev)}>
      <>
        <div className="text-black">Link</div>
        <div className="text-black font-bold">
          {process.env.NEXT_PUBLIC_URL_SITE}
          {"/"}
          {linkForChanel}
        </div>

        <div className="flex justify-end">
          <button
            className="transition-all hover:bg-blue-500 bg-custom-blue-100 h-[54px] px-6  rounded-md text-2xl text-white justify-end items-center"
            onClick={() => {
              setIsOpenLinkForChanel((prev) => !prev);
            }}
          >
            Close
          </button>{" "}
        </div>
      </>
    </Modal>
  );
};

export default ModalIsOpenLinkForChanel;
