import { useLoaderData, useSubmit, useTransition } from "@remix-run/react";
import { useMemo } from "react";
import { availableHelp } from "~/utils/help.server";

export const helpAction = async ({ user, formData }) => {
  if (formData.get("action") !== "helpSettings") return;
  if (formData.get("toggleAllHelp")) {
    user.helpSettings = user.helpSettings?.length === 0 ? availableHelp : [];
    await user.save();
    return;
  }
  if (!formData.get("helpSetting")) return;
  user.helpSettings = user.helpSettings.filter((_helpSetting) => _helpSetting !== formData.get("helpSetting"));
  await user.save();
};

export const HelpBlock = ({ children, helpSetting, className = "" }) => {
  const { user } = useLoaderData();
  const submit = useSubmit();
  const transition = useTransition();

  const showHelp = useMemo(() => {
    const setting = user?.helpSettings.includes(helpSetting);
    if (!["loading", "submitting"].includes(transition.state)) return setting;
    if (transition.submission?.formData?.get("helpSetting") === helpSetting) return false;
    if (transition.submission?.formData?.get("toggleAllHelp")) {
      if (user.helpSettings?.length === 0) return true;
      return false;
    }
    return setting;
  }, [transition, user, helpSetting]);

  if (!showHelp) return null;

  return (
    <div
      className={[
        "help-block relative m-2 rounded border-2 border-yellow-400 bg-yellow-100 p-2 text-center text-gray-400",
        className,
      ].join(" ")}
    >
      <button
        type="button"
        onClick={function hideSetting() {
          const formData = new FormData();
          formData.append("action", "helpSettings");
          formData.append("helpSetting", helpSetting);
          submit(formData, { method: "POST", replace: true });
        }}
        className="absolute right-1 top-0"
      >
        &#10005;
      </button>
      <div className="break-words">{children}</div>
    </div>
  );
};

export const MainHelpButton = ({ className }) => {
  const { user } = useLoaderData();
  const submit = useSubmit();
  const transition = useTransition();

  const onShowAllHelp = () => {
    const formData = new FormData();
    formData.append("action", "helpSettings");
    formData.append("toggleAllHelp", true);
    submit(formData, { method: "POST", replace: true });
  };

  const caption = useMemo(() => {
    if (["loading", "submitting"].includes(transition.state)) {
      if (transition.submission?.formData?.get("helpSetting")) {
        if (user.helpSettings?.length === 1) return "Show help";
        return "Hide help";
      }
      if (transition.submission?.formData?.get("toggleAllHelp")) {
        if (user.helpSettings?.length === 0) return "Hide help";
        return "Show help";
      }
    }
    return user.helpSettings.length === 0 ? "Show help" : "Hide help";
  }, [transition, user]);

  return (
    <button type="button" className={className} onClick={onShowAllHelp}>
      {caption}
    </button>
  );
};

export default HelpBlock;
