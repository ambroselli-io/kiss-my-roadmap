import UserModel from "~/db/models/user.server";
import bcrypt from "bcryptjs";
import { json, useLocation, useNavigate, useOutletContext } from "react-router";
import { Form, Link, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { createUserSession } from "~/services/auth.server";
import { ModalBody, ModalContainer, ModalFooter, ModalHeader } from "~/components/TailwindModal";
import PasswordInput from "~/components/PasswordInput";
import OpenInNewWindowIcon from "~/components/icons/OpenInNewWindowIcon";
import { getPasswordStrengthInTime } from "~/utils/passwordStrength.client";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const page = formData.get("page");
  const email = formData.get("email");
  if (!email?.length) {
    return json({ ok: false, errorField: "email", error: "No email, no chocolate." }, { status: 400 });
  }
  const password = formData.get("password");
  if (!password) {
    return json({ ok: false, errorField: "password", error: "Plase provide a password." }, { status: 400 });
  }

  if (page === "signup") {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser?.password?.length > 0) {
      return json(
        {
          ok: false,
          errorField: "email",
          error: "This email is already registered in our database. Please signin instead!",
        },
        { status: 400 }
      );
    }
    const confirmPassword = formData.get("confirm-password");
    if (password !== confirmPassword) {
      return json({ ok: false, errorField: "confirm-password", error: "Passwords don't match!" }, { status: 400 });
    }

    const user = await UserModel.findOneAndUpdate(
      { email },
      { password: await bcrypt.hash(password, 10) },
      { upsert: true, returnDocument: "after" }
    );

    const cookieToSet = await createUserSession(request, user);
    return json({ ok: true, data: user.me() }, { status: 200, headers: { "Set-Cookie": cookieToSet } });
  }
  if (page === "signin") {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return json(
        { ok: false, errorField: "email", error: "This email doesn't exist in our database. Please signup instead!" },
        { status: 400 }
      );
    }
    // test a matching password
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return json({ ok: false, errorField: "password", error: "This password doesn't match!" }, { status: 400 });
    }
    const cookieToSet = await createUserSession(request, user);
    return json({ ok: true, data: user.me() }, { status: 200, headers: { "Set-Cookie": cookieToSet } });
  }
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

  const [showPassword, setShowPassword] = useState(false);

  const onSwitchSigninUp = () => {
    setPage((prev) => (prev === "signup" ? "signin" : "signup"));
  };

  return (
    <ModalContainer open onClose={onClose} blurryBackground>
      <ModalHeader title="Let's get to know each other!" />
      <ModalBody className="!pb-0">
        <Form method="POST" className="px-4 pt-4" id="register-form">
          <div className="flex flex-col">
            <input type="hidden" name="page" value={page} />
            <div className="mb-3 flex flex-col-reverse gap-2">
              <input
                name="email"
                type="email"
                id="email"
                className="outline-main block w-full rounded border border-black bg-transparent p-2.5 text-black transition-all"
                autoComplete="email"
                placeholder="ilike@froadmaps.com"
                defaultValue={typeof window !== "undefined" ? window.localStorage.getItem("last-login-email") : ""}
                onChange={(e) => {
                  if (showErrors) setShowErrors(false);
                }}
              />
              <label htmlFor="email">Email</label>
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
