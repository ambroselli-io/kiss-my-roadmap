import { useSearchParams } from "@remix-run/react";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";
const EasyContact = ({ param }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const onClose = () => {
    searchParams.delete(param);
    setSearchParams(searchParams);
  };

  return (
    <ModalContainer open={searchParams.get(param) === "true"} onClose={onClose} blurryBackground>
      <ModalHeader title="Thanks for reaching out!" />
      <ModalBody className="!p-8">
        💋 Kiss my Roadmap is on MVP stage, so all features are not available yet.
        <br />
        <br />
        If you want to get in touch with me for any reason (feedback, complain, feature request, questions, etc), please
        either
        <ul className="list-inside list-disc">
          <li>
            send me an email at{" "}
            <a className="text-blue-500 underline" href="mailto:arnaud@ambroselli.io?subject=About Kiss my Roadmap">
              arnaud@ambroselli.io
            </a>{" "}
          </li>
          <li>
            or DM me on Twitter at{" "}
            <a
              href="https://twitter.com/ambroselli_io"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 underline"
            >
              @ambroselli_io
            </a>
          </li>
        </ul>
        <br />
      </ModalBody>
      <ModalFooter className="flex-col items-center overflow-hidden !p-0">
        <button type="button" onClick={onClose} className="w-full bg-black px-4 py-3 text-white">
          🫡 Got it!
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};

export default EasyContact;
