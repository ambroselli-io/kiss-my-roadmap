import { Link } from "@remix-run/react";
import { useLoaderData } from "@remix-run/node";
import { createUserSession } from "../../services/auth.server";
import UserModel from "../../db/models/user.server";
import { validateMagicLink } from "../../services/magic-link";

export const loader = async ({ request }) => {
  try {
    const email = validateMagicLink(request.url);
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Sign in link invalid. Please request a new one.");
    }
    return createUserSession(request, user, "/");
  } catch (error) {
    return {
      ok: false,
      error: error.toString().includes("Please request a new one")
        ? "Le lien est expiré, veuillez en demander un nouveau"
        : null,
    };
  }
};

export default function Magic() {
  const loaderData = useLoaderData();
  return (
    <>
      <div>{typeof loaderData.error === "string" ? loaderData.error : "Plouf"}</div>
      <Link to="/" className="mt-14 block text-xs text-sky-800">
        Accueil
      </Link>
    </>
  );
}
