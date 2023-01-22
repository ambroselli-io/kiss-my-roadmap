import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { APP_NAME, SECRET } from "../config.server";
import UserModel from "../db/models/user.server";

const sessionExpirationTime = 1000 * 60 * 60 * 24 * 365;

export const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: `${APP_NAME}_session`,
    secrets: [SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: sessionExpirationTime / 1000,
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
  },
});

export const getUserFromCookie = async (request, { redirectTo = "/", noRedirect = false } = {}) => {
  /* TEMP */
  const user = await UserModel.findOne();
  // const session = await getSession(request.headers.get("Cookie"));
  // if (!session) {
  //   if (!noRedirect) {
  //     throw redirect(redirectTo);
  //   }
  // }
  // const userId = session.get("userId");
  // const user = await UserModel.findById(userId);
  // if (!user && !noRedirect) throw redirect(redirectTo);
  // if (!noRedirect) return redirect("/profil");
  return user;
};

export const getUnauthentifiedUserFromCookie = (request) => getUserFromCookie(request, { noRedirect: true });

export const createUserSession = async (request, user, redirectTo = "/") => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user._id);
  user.set({ lastLoginAt: Date.now() });
  await user.save();
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
