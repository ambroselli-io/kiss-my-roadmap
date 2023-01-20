import { useEffect } from "react";
import { useFetcher, useLocation } from "@remix-run/react";
import Input from "./Input";
import Modal from "./Modal";
import useSetDocumentTitle from "app/services/useSetDocumentTitle";

const ContactUs = ({ isOpen, hide, user = null }) => {
  const fetcher = useFetcher();
  const location = useLocation();

  useEffect(() => {
    if (fetcher.data?.error) alert(fetcher.data.error);
  }, [fetcher.data?.error]);

  useSetDocumentTitle("Contactez-nous | Debator", { isVisible: isOpen });

  if (fetcher?.type === "done" && fetcher?.data?.ok === true) {
    return (
      <Modal isOpen={isOpen} hide={hide} title="Nous contacter">
        <div className="flex flex-col items-center">
          <p className="text-center">Merci !</p>
          <button
            type="button"
            onClick={hide}
            className="mt-4 rounded-lg border border-app bg-app px-4 py-2 text-white disabled:opacity-50"
          >
            Fermer
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} hide={hide} title="Nous contacter">
      <fetcher.Form
        method="POST"
        action="/actions/contact-us"
        id="contact-us"
        className="flex w-full flex-col items-center gap-8"
      >
        <input type="hidden" name="subject" defaultValue="Une demande de Debator" />
        <input
          type="hidden"
          name="origin"
          defaultValue={location.pathname + location.search}
        />
        <Input
          type="text"
          name="name"
          autoComplete="name"
          id="contact-us-name"
          label="🐒 Votre nom"
          placeholder="Votre nom"
          defaultValue={user?.name}
          required
        />
        <Input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          id="contact-us-email"
          label="＠ Votre Email"
          placeholder="Votre email"
          defaultValue={user?.email}
          required
        />
        <Input
          textarea
          type="text"
          name="description"
          id="contact-us-description"
          label="🎙 Que voulez-vous nous dire ?"
          placeholder="Une remarque sur le sujet ou le défi que vous avez choisi ? Une demande particulière ? Un message de soutien ou une critique ? Allez-y !"
          required
        />
        <button
          type="submit"
          disabled={["loading", "submitting"].includes(fetcher.state)}
          className="mt-4 rounded-lg border border-app bg-app px-4 py-2 text-white disabled:opacity-50"
        >
          {["loading", "submitting"].includes(fetcher.state)
            ? "Envoi en cours"
            : "Envoyer"}
        </button>
        <button type="button" onClick={hide} className="mt-2 underline">
          Annuler
        </button>
      </fetcher.Form>
    </Modal>
  );
};

export default ContactUs;
