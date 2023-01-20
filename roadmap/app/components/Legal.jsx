import { useEffect, useState } from "react";
import OpenInNewWindowIcon from "./icons/OpenInNewWindowIcon";
import Modal from "./Modal";

const Legal = ({ showLegal, setShowLegal }) => {
  const [email, setEmail] = useState("");
  useEffect(() => {
    setEmail(window?.atob("YXJuYXVkQGFtYnJvc2VsbGkuaW8="));
  }, []);

  if (!showLegal) return null;
  return (
    <Modal isOpen hide={() => setShowLegal(false)} title="Mentions légales">
      <p>
        <span className="font-marker text-app">Debator</span> est un jeu de société
        développé par Arnaud Ambroselli, développeur d'applications sur ordinateur et
        smartphones.
        <br />
        <br />
        La société qui déploie ce jeu est&nbsp;:
        <br />
        SASU AMBROSELLI.IO
        <br />
        15 rue des Halles
        <br />
        75001 Paris
        <br />
        France
        <br />
        <br />
        Contact: {email}
        <br />
        <br />
        Nous n'utilisons pas de cookie, à part celui qui vous permet de savoir que vous
        êtes connecté à Debator. Nous ne partageons pas vos informations à aucune tierce
        partie. Notre projet est{" "}
        <a
          href="https://github.com/ambroselli-io/debator"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 underline"
        >
          Open Source <OpenInNewWindowIcon />
        </a>
        <br />
        <br />
        Citation préférée : « Deux mythes limitent actuellement notre imaginaire collectif
        : le mythe selon lequel la publicité est le seul modèle économique possible pour
        les entreprises en ligne, et le mythe selon lequel il est trop tard pour changer
        le fonctionnement des plateformes. Sur ces deux points, nous devons être un peu
        plus créatifs.» Tim Berners Lee.
      </p>
    </Modal>
  );
};

export default Legal;
