import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { APP_NAME, SECRET } from "../config.server";
import UserModel from "../db/models/user.server";

const sessionExpirationTime = 1000 * 60 * 60 * 24 * 365 * 10; // 10 years

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

export const getUserFromCookie = async (request, { failureRedirect = "/", optional = false } = {}) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session) {
    throw redirect(failureRedirect);
  }
  const userId = session.get("userId");
  const user = await UserModel.findById(userId);
  if (user) return user;
  if (optional) return null;
  throw redirect(failureRedirect);
};

export const getUnauthentifiedUserFromCookie = (request) => getUserFromCookie(request, { optional: true });

export const createUserSession = async (request, user, failureRedirect) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user._id);
  user.set({ lastLoginAt: Date.now() });
  await user.save();
  if (!failureRedirect) return await commitSession(session);
  return redirect(failureRedirect, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
