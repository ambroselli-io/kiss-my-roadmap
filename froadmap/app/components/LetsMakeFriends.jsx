import { useSearchParams } from "react-router-dom";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";

const LetsMakeFriends = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClose = () => {
    searchParams.delete("lets-make-friends");
    setSearchParams(searchParams);
  };

  return (
    <ModalContainer open={searchParams.get("lets-make-friends") === "true"} onClose={onClose} blurryBackground>
      <ModalHeader title="New feature" />
      <ModalBody>Put your form here</ModalBody>
      <ModalFooter>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};

export default LetsMakeFriends;
