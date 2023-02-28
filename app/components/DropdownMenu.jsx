import { useState, useEffect } from "react";

export const DropdownMenu = ({ children, title, className, closeOnItemClick, id }) => {
  const [showMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const listener = (e) => {
      if (closeOnItemClick && e.target.closest(".menu-container")) {
        setOpenMenu(false);
        return;
      }
      if (e.target.closest(".menu-container")) return;

      setOpenMenu(false);
    };
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, [showMenu, closeOnItemClick]);

  return (
    <div className={["relative z-50", className].join(" ")}>
      <button
        type="button"
        onClick={() => setOpenMenu((f) => !f)}
        className={[
          "menu-button block h-full px-4 py-2 text-xs",
          showMenu ? "show-menu bg-black text-white" : "hide-menu",
        ].join(" ")}
      >
        {title}
      </button>
      {showMenu && (
        <div
          id={id}
          className={[
            "menu-container absolute top-8 left-0 w-64 overflow-hidden border border-gray-300 bg-white",
            "[&_button]:w-full [&_button]:p-2 [&_button]:text-left [&_button:hover]:bg-gray-300",
            "[&_a]:w-full [&_a]:p-2 [&_a]:text-left [&_a:hover]:bg-gray-300",
          ].join(" ")}
        >
          {children}
        </div>
      )}
    </div>
  );
};
