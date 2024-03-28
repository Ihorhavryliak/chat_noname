import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";

type ModalType = {
  open: boolean;
  setOpen: () => void;
  children: JSX.Element;
};
const Modal = ({ open, setOpen, children }: ModalType) => {
  const cancelButtonRef = useRef(null);
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10 " initialFocus={cancelButtonRef} onClose={() => setOpen()}>
        <Transition.Child
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-60"
          leave="duration-200 ease-out"
          leaveFrom="opacity-60"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black transition-opacity opacity-60" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen flex items-center justify-center overflow-y-auto">
          <Transition.Child
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-200"
            leave="duration-200 ease-out"
            leaveFrom="opacity-200"
            leaveTo="opacity-0"
          >
            <Dialog.Panel className="relative overflow-hidden  bg-white text-left shadow-xl sm:my-8  max-w-[1200px] w-full rounded-xl border border-white pt-4 px-6 pb-6 font-roboto shadow-variant-4">
              <div className="flex justify-end pb-4">
                <button
                  onClick={() => setOpen()}
                  type="button"
                  className="outline-none text-3xl text-custom-gray-120 hover:text-gray-400 text-gray-800"
                  ref={cancelButtonRef}
                >
                  X
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
export default Modal;
