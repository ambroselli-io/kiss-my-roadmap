import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "./TailwindModal";

const OnboardModal = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const onClose = () => {
    window.sessionStorage.setItem("onboard-modal", "true");
    searchParams.delete("onboarding");
    setSearchParams(searchParams);
    setIsOpen(false);
  };

  useEffect(() => {
    if (
      location.pathname.includes("/new") &&
      window.sessionStorage.getItem("onboard-modal") !== "true" &&
      !searchParams.get("onboarding")
    ) {
      setIsOpen(true);
      searchParams.set("onboarding", "true");
      setSearchParams(searchParams);
    }
  }, [location.pathname, searchParams, setSearchParams]);

  return (
    <ModalContainer open={isOpen} onClose={onClose} blurryBackground size="3xl">
      <ModalHeader title={<span className="text-4xl">Welcome to Kiss my Roadmap 💋</span>} />
      <ModalBody className="!pb-0">
        <div className="flex flex-col gap-3 p-8">
          <p className="text-lg font-bold">
            💋 Kiss my Roadmap is a free tool to make you prioritize all your planned features/tasks.
          </p>
          <p>The feature with the highest score is the one you should do.</p>
          <p>For each feature:</p>
          <ul className="list-inside list-disc">
            <li>
              Size its <b className="text-red-700">cost</b> from XS to XL: the more cost it has, the less point it gets.
            </li>
            <li>
              Size its <b className="text-green-700">added value</b> from XS to XL: the more impact it has, the more
              point it gets.
            </li>
            <li>
              This will give you a <b>score</b>: the higher the score, the more you should do it.
            </li>
            <li>
              Check the <b className="text-gray-500">priority</b> box if you feel a feature has a bad score but you
              still want to do it, its score will be boosted. But don't abuse it!
            </li>
            <li>
              Finally, sort and filter your features by <b className="text-blue-700">status</b> and get to work.
            </li>
          </ul>
          <p>You're good to go!</p>
        </div>
      </ModalBody>
      <ModalFooter className="flex-col items-center overflow-hidden !p-0">
        <button type="button" className="w-full bg-black px-4 py-3 text-white" onClick={onClose}>
          Let's build my first roadmap!
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};

export default OnboardModal;
