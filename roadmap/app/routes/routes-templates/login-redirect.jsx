import { redirect } from "@remix-run/node";
import { useSearchParams, useTransition } from "@remix-run/react";
import Input from "app/components/Input";
import UserModel from "app/db/models/user.server";
import { sendEmail } from "app/services/email.server";
import { createMagicLinkEmail } from "app/services/magic-link";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const magicLink = formData.get("magicLink");
  if (magicLink) {
    const url = new URL(magicLink);
    return redirect(`${url.pathname}${url.search}`);
  }
  const email = formData.get("email");
  if (!email) return { alert: "Veuillez fournir un email" };
  let newUser = false;
  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.create({
      email,
      licence: "monthly",
      licenceStartedAt: Date.now(),
    });
    newUser = true;
  }
  const magicLinkEmail = createMagicLinkEmail(user, newUser);
  await sendEmail(magicLinkEmail);
  return redirect(`/profil/login-redirect?email=${email}`);
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const transition = useTransition();

  return (
    <>
      <p className="max-w-[68ch] text-center">
        Veuillez cliquer sur le lien envoyé à <b>{searchParams.get("email")}</b> pour vous
        connecter, <wbr />
        ou le rentrer ci-dessous (surtout si vous avez mis cette page en signet sur votre
        téléphone)
      </p>
      <form
        method="POST"
        action="/profil/login-redirect"
        className="flex w-full max-w-[68ch] flex-col items-center"
      >
        <Input
          type="url"
          name="magicLink"
          id="magicLink"
          className="w-full"
          required
          placeholder="https://debator.fr/profil/magic?kodyKey=123456"
        />
        <button
          className="mx-auto mt-4 rounded-lg border border-app bg-app px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          disabled={transition.submission}
        >
          {transition.submission ? "Connection..." : "Se connecter"}
        </button>
      </form>
    </>
  );
};

export default Index;
