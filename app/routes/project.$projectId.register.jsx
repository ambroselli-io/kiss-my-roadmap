import UserModel from "~/db/models/user.server";
import bcrypt from "bcryptjs";
import { json, useLocation, useNavigate } from "react-router";
import { Form, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createUserSession } from "~/services/auth.server";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";
import PasswordInput from "~/components/PasswordInput";
import OpenInNewWindowIcon from "~/components/icons/OpenInNewWindowIcon";
import { getPasswordStrengthInTime } from "~/utils/passwordStrength.client";
import EventModel from "~/db/models/event.server";
import { usePageLoadedEvent, useUserEvent } from "./action.event";
import ProjectModel from "~/db/models/project.server";
import { redirect } from "@remix-run/node";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const page = formData.get("page");
  const email = formData.get("email");
  const username = formData.get("username");
  if (!email?.length && !username?.length) {
    EventModel.create({
      event: "REGISTER NO EMAIL PROVIDED",
    });
    return json({ ok: false, errorField: "email", error: "No email/username, no chocolate." }, { status: 400 });
  }
  const password = formData.get("password");
  if (!password) {
    EventModel.create({
      event: "REGISTER NO PASSWORD PROVIDED",
    });
    return json({ ok: false, errorField: "password", error: "Plase provide a password." }, { status: 400 });
  }

  if (page === "signup") {
    const existingUser = await UserModel.findOne({ email, username });
    if (existingUser?.password?.length > 0) {
      EventModel.create({
        event: "REGISTER SIGNUP EMAIL ALREADY REGISTERED",
        user: existingUser._id,
      });
      return json(
        {
          ok: false,
          errorField: "email",
          error: "This credential is already registered in our database. Please signin instead!",
        },
        { status: 400 }
      );
    }
    const confirmPassword = formData.get("confirm-password");
    if (password !== confirmPassword) {
      EventModel.create({
        event: "REGISTER SIGNUP PASSWORDS DON'T MATCH",
        value: email || username,
      });
      return json({ ok: false, errorField: "confirm-password", error: "Passwords don't match!" }, { status: 400 });
    }

    const user = await UserModel.findOneAndUpdate(
      { email, username },
      { password: await bcrypt.hash(password, 10) },
      { upsert: true, returnDocument: "after" }
    );

    const cookieToSet = await createUserSession(request, user);
    EventModel.create({
      event: "REGISTER SIGNUP SUCCESS",
      user: user?._id,
    });
    return json({ ok: true, data: user.me() }, { status: 200, headers: { "Set-Cookie": cookieToSet } });
  }
  if (page === "signin") {
    const user = await UserModel.findOne({ email, username });
    if (!user) {
      EventModel.create({
        event: "REGISTER SIGNIN EMAIL NOT FOUND",
        value: email || username,
      });
      return json(
        {
          ok: false,
          errorField: "email",
          error: "This email/username doesn't exist in our database. Please signup instead!",
        },
        { status: 400 }
      );
    }
    // test a matching password
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      EventModel.create({
        event: "REGISTER SIGNIN PASSWORD NOT MATCH",
        user,
      });
      return json({ ok: false, errorField: "password", error: "This password doesn't match!" }, { status: 400 });
    }
    const cookieToSet = await createUserSession(request, user);
    EventModel.create({
      event: "REGISTER SIGNIN SUCCESS",
      user,
    });
    const projects = await ProjectModel.countDocuments({ "users.user": user._id });
    if (projects === 0) {
      return json({ ok: true, data: user.me() }, { status: 200, headers: { "Set-Cookie": cookieToSet } });
    } else {
      return redirect("/", { headers: { "Set-Cookie": cookieToSet } });
    }
  }
};

export const loader = async () => {
  EventModel.create({
    event: "REGISTER PAGE LOADED",
  });
  return null;
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onClose = () => {
    navigate(location.pathname.replace("/register", ""));
  };

  const [showErrors, setShowErrors] = useState(false);

  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.error) setShowErrors(true);
    if (actionData?.ok) {
      if (actionData?.data?.email) window.localStorage.setItem("last-login-email", actionData?.data?.email);
      navigate(location.pathname.replace("/register", ""));
    }
  }, [actionData, navigate, location]);
  const [searchParams] = useSearchParams();
  const [passwordTimeToHack, setPasswordTimeToHack] = useState("");
  const [page, setPage] = useState(() => {
    // "signup", "signin", "forgot-password", "reset-password"
    if (searchParams.get("xyz")?.length) return "reset-password";
    if (typeof window !== "undefined" && window.localStorage.getItem("last-login-email")) return "signin";
    return "signup";
  });

  const [credential, setCredential] = useState("email");
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSwitchSigninUp = () => {
    sendUserEvent({ event: `REGISTER SWITCH TO ${page === "signup" ? "signin" : "signup"}` });
    setPage((prev) => (prev === "signup" ? "signin" : "signup"));
  };

  const sendUserEvent = useUserEvent();
  usePageLoadedEvent({
    event: "REGISTER PAGE LOADED",
  });

  return (
    <ModalContainer open={!searchParams.get("onboarding")} onClose={onClose} blurryBackground>
      <ModalHeader title="Let's get to know each other!" />
      <ModalBody className="!pb-0">
        <Form method="POST" className="px-4 pt-4" id="register-form">
          <div className="flex flex-col">
            <input type="hidden" name="page" value={page} />
            <div className="mb-3 flex flex-col-reverse gap-2">
              <input
                name={credential === "email" ? "email" : "username"}
                type={credential === "email" ? "email" : "text"}
                id={credential === "email" ? "email" : "username"}
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                autoComplete={credential === "email" ? "email" : "username"}
                placeholder="ilike@froadmaps.com"
                defaultValue={typeof window !== "undefined" ? window.localStorage.getItem("last-login-email") : ""}
                onChange={(e) => {
                  if (showErrors) setShowErrors(false);
                }}
              />
              <div className="flex items-baseline justify-between">
                <label htmlFor="email">{credential === "email" ? "Email" : "Username"}</label>
                <button
                  onClick={() => {
                    if (!showEmailAlert && page === "signup") return setShowEmailAlert(true);
                    const newCredential = credential === "email" ? "username" : "email";
                    if (newCredential === "username")
                      sendUserEvent({ event: `REGISTER PREFER ${newCredential.toUpperCase()}` });
                    setCredential(newCredential);
                  }}
                  className="text-xs"
                  type="button"
                >
                  {showEmailAlert ? (credential === "username" ? "I " : "I know, I really ") : "I "}prefer{" "}
                  {credential === "email" ? "no email" : "email"}
                </button>
              </div>
              {credential === "email" && showEmailAlert && (
                <p className="help-block relative m-2 hidden rounded border-2 border-yellow-400 bg-yellow-100 p-2 text-center text-gray-400 md:block">
                  Don't worry, I have no plan to send you any emails afterwards. This is just for protecting your data
                  with a password, and for you to be able to recover that password if you've lost it. If you really
                  choose an anonymous username, I won't be able to help you recover your password.
                </p>
              )}
            </div>
            <p
              className={[
                "-mt-1.5 mb-1.5 text-xs",
                !!showErrors && actionData?.errorField === "email" ? "text-red-500" : "text-transparent",
              ].join(" ")}
            >
              {!!showErrors && actionData?.errorField === "email" ? actionData.error : "no email error"}
            </p>
            <div className="mb-3 flex flex-col-reverse gap-2">
              <PasswordInput
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                name="password"
                id="password"
                placeholder="no need !?@123-:, the longest the best, that's it"
                autoComplete="current-password"
                onChange={(e) => {
                  if (showErrors) setShowErrors(false);
                  if (["signup", "reset-password"].includes(page))
                    setPasswordTimeToHack(getPasswordStrengthInTime(e.target.value));
                }}
                setShowPassword={setShowPassword}
                showPassword={showPassword}
              />
              <div className="flex items-baseline justify-between">
                <label htmlFor="password">Password</label>
                <button
                  onClick={() => {
                    sendUserEvent({ event: "REGISTER FORGOT PASSWORD CLICKED" });
                    alert("Oups... I'm working on it! Contact me on Twitter at @ambroselli_io if you need it now!");
                  }}
                  className="text-xs"
                  type="button"
                >
                  Forgot password...
                </button>
              </div>
            </div>
            <p
              className={[
                "-mt-1.5 mb-1.5 text-xs",
                !!showErrors && actionData?.errorField === "password" ? "text-red-500" : "text-transparent",
                ["signup", "reset-password"].includes(page) && passwordTimeToHack?.length > 0 ? "!text-black" : "",
              ].join(" ")}
            >
              {!!showErrors && actionData?.errorField === "password"
                ? actionData.error
                : ["signup", "reset-password"].includes(page)
                ? passwordTimeToHack
                : "no password error"}
            </p>
            {page === "signup" && (
              <>
                <div className="mb-3 flex flex-col-reverse gap-2">
                  <PasswordInput
                    className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="the ultimate is long and automatically generated"
                    autoComplete="current-password"
                    setShowPassword={setShowPassword}
                    onChange={(e) => {
                      if (showErrors) setShowErrors(false);
                    }}
                    showPassword={showPassword}
                  />
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="confirm-password">Confirm password</label>
                    <a
                      className="inline-flex items-baseline gap-1 text-xs underline"
                      href="https://xkcd.com/936/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Tips <OpenInNewWindowIcon className="h-2 w-2" />
                    </a>
                  </div>
                </div>
                <p
                  className={[
                    "-mt-1.5 mb-1.5 text-xs",
                    !!showErrors && actionData?.errorField === "confirm-password" ? "text-red-500" : "text-transparent",
                  ].join(" ")}
                >
                  {!!showErrors && actionData?.errorField === "confirm-password"
                    ? actionData.error
                    : "no confirm password error"}
                </p>
              </>
            )}
          </div>
          {["signup", "signin"].includes(page) && (
            <button type="button" className="w-full bg-white text-xs text-black" onClick={onSwitchSigninUp}>
              {page === "signup" && "Already have an account? Sign in"}
              {page === "signin" && "No account yet ? Sign up"}
            </button>
          )}
        </Form>
      </ModalBody>
      <ModalFooter className="flex-col items-center overflow-hidden !p-0">
        <button type="submit" form="register-form" className="w-full bg-black px-4 py-3 text-white">
          {page === "signup" && "Sign up"}
          {page === "signin" && "Sign in"}
          {page === "forgot-password" && "Send me a reset link"}
          {page === "reset-password" && "Reset password"}
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};

export default Register;
