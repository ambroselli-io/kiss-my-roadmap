import { useNavigate } from "react-router";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";

const NewFeature = () => {
  const navigate = useNavigate();
  const onClose = () => {
    navigate(-1);
  };

  return (
    <ModalContainer open onClose={onClose}>
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

export default NewFeature;
