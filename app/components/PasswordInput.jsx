import React from "react";
import EyeIcon from "./icons/EyeIcon";

const PasswordInput = ({ className, showPassword, setShowPassword, type, ...props }) => (
  <div className="relative mb-1.5 flex cursor-pointer items-center">
    <input
      className={[className, "!mb-0", showPassword ? "show-password" : "hide-password"].join(" ")}
      type={type || showPassword ? "text" : "password"}
      {...props}
    />
    <EyeIcon
      strikedThrough={showPassword}
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-4 mb-auto"
    />
  </div>
);

export default PasswordInput;
