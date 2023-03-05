import { availableHelp } from "../utils/help.server";
import { useSubmit } from "react-router-dom";

export const helpAction = async ({ formData }) => {
  const userHelpSettings = JSON.parse(window.localStorage.getItem("userHelpSettings") || JSON.stringify(availableHelp));
  if (formData.get("action") !== "helpSettings") return;
  if (formData.get("toggleAllHelp")) {
    window.localStorage.setItem(
      "userHelpSettings",
      JSON.stringify(userHelpSettings?.length === 0 ? availableHelp : [])
    );
    return;
  }
  if (!formData.get("helpSetting")) return;
  window.localStorage.setItem(
    "userHelpSettings",
    JSON.stringify(userHelpSettings.filter((_helpSetting) => _helpSetting !== formData.get("helpSetting")))
  );
};

export const HelpBlock = ({ children, helpSetting, className = "" }) => {
  const submit = useSubmit();

  const userHelpSettings = JSON.parse(window.localStorage.getItem("userHelpSettings") || JSON.stringify(availableHelp));

  const showHelp = userHelpSettings.includes(helpSetting);

  if (!showHelp) return null;

  return (
    <div
      className={[
        "help-block relative m-2 hidden rounded border-2 border-yellow-400 bg-yellow-100 p-2 text-center text-gray-400 md:block",
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
  const submit = useSubmit();

  const onShowAllHelp = () => {
    const formData = new FormData();
    formData.append("action", "helpSettings");
    formData.append("toggleAllHelp", true);
    submit(formData, { method: "POST", replace: true });
  };

  const userHelpSettings = JSON.parse(window.localStorage.getItem("userHelpSettings") || JSON.stringify(availableHelp));

  const caption = userHelpSettings.length === 0 ? "Show help" : "Hide help";

  return (
    <button type="button" className={["hidden md:inline-block", className].join(" ")} onClick={onShowAllHelp}>
      {caption}
    </button>
  );
};

export default HelpBlock;
