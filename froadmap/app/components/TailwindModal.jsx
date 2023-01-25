import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";

// inspired by https://tailwindui.com/components/application-ui/overlays/modals#component-47a5888a08838ad98779d50878d359b3

/*

Use example:
<ModalContainer>
  <ModalHeader title="A title"><p>anything inside here</p></ModalHeader>
  <ModalBody><p>anything inside here</p></ModalBody>
  <ModalFooter><p>anything inside here, usually some buttons</p></ModalFooter>
</ModalContainer>


 */

const ModalContainer = ({
  children,
  open,
  onClose = null,
  // setOpen,
  className = "",
  onAfterEnter = () => null,
  onAfterLeave = () => null,
  onBeforeLeave = () => null,
  size = "lg", // lg, xl, 3xl, full
  blurryBackground = false,
}) => {
  const backgroundRef = useRef(null);

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className={["relative z-[3000]", className].join(" ")}
          // onClose={setOpen} // uncomment this if you want backdrop click to close modal
          onClose={nullFunction} // uncomment this if you want backdrop click to NOT close modal
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className={[
                "fixed inset-0 bg-black/70 transition-opacity ",
                blurryBackground ? "backdrop-blur-sm" : "",
              ].join(" ")}
            />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto" ref={backgroundRef}>
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                afterEnter={() => {
                  backgroundRef?.current?.scrollTo(0, 0);
                  onAfterEnter();
                }}
                beforeLeave={onBeforeLeave}
                afterLeave={onAfterLeave}
              >
                <Dialog.Panel
                  className={[
                    "relative flex max-h-[90vh] transform flex-col rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ",
                    size === "lg" ? "sm:max-w-lg" : "",
                    size === "xl" ? "sm:max-w-xl" : "",
                    size === "3xl" ? "sm:max-w-3xl" : "",
                    size === "full" ? "sm:max-w-[90vw]" : "",
                  ].join(" ")}
                >
                  {children}
                  {!!onClose && (
                    <button
                      type="button"
                      aria-label="Fermer"
                      className="absolute top-4 right-0 text-gray-900 sm:px-6"
                      onClick={onClose}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

const nullFunction = () => null;

const ModalHeader = ({ children, title }) => {
  return (
    <div className="flex w-full shrink-0 items-center justify-between rounded-t-lg border-b border-gray-200 bg-white">
      <div className="w-full py-4 sm:flex sm:items-start">
        <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
          {!!title && (
            <Dialog.Title as="h3" className="mb-0 px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6">
              {title}
            </Dialog.Title>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalBody = ({ children, className = "" }) => {
  return (
    <div className="shrink bg-white pb-4">
      <div className="sm:flex sm:items-start">
        <div className={["w-full text-center sm:mt-0 sm:text-left", className].join(" ")}>{children}</div>
      </div>
    </div>
  );
};

const ModalFooter = ({ children }) => {
  return (
    <div className="shrink-0 rounded-b-lg border-t border-gray-200 bg-gray-50 px-4 py-3 sm:flex sm:justify-end sm:px-6">
      {children}
    </div>
  );
};

export { ModalHeader, ModalBody, ModalFooter, ModalContainer };
