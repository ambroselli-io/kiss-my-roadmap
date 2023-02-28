import { forwardRef, useEffect, useRef } from "react";
import Required from "./Required";

// https://flowbite.com/docs/forms/search-input/
const Input = forwardRef(
  (
    {
      type,
      label,
      placeholder,
      name,
      className = "",
      componentClassName = "",
      id,
      required = false,
      textarea = false,
      notFancy = false,
      onChange = null,
      saveInCache = true,
      ...props
    },
    refForwarded
  ) => {
    const ref = useShareForwardedRef(refForwarded);

    useEffect(() => {
      if (saveInCache && window.sessionStorage.getItem(id)?.length && !props.disabled) {
        ref.current.value = window.sessionStorage.getItem(id);
        onChange?.({ target: ref.current });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, ref]);

    const Tag = textarea ? "textarea" : "input";
    return (
      <div className={`flex w-full flex-col items-start ${label ? "gap-2" : ""} ${componentClassName}`}>
        {label && (
          <label htmlFor={`${name}-${id}`}>
            {label}
            {label && required && <Required />}
          </label>
        )}
        <Tag
          type={type}
          ref={ref}
          id={id ? `${name}-${id}` : name}
          name={name}
          className={`${
            notFancy
              ? ""
              : "block w-full rounded-lg border border-black bg-white p-2.5 text-gray-900 outline-app dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          } ${className}`}
          placeholder={placeholder}
          required={required}
          onWheel={type === "number" ? (e) => e.currentTarget.blur() : null}
          onKeyUp={(e) => window.sessionStorage.setItem(id, e.currentTarget.value)}
          onChange={onChange}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
// https://itnext.io/reusing-the-ref-from-forwardref-with-react-hooks-4ce9df693dd
const useShareForwardedRef = (forwardedRef) => {
  // final ref that will share value with forward ref. this is the one we will attach to components
  const innerRef = useRef(null);

  useEffect(() => {
    // after every render - try to share current ref value with forwarded ref
    if (!forwardedRef) {
      return;
    }
    if (typeof forwardedRef === "function") {
      forwardedRef(innerRef.current);
    } else {
      // by default forwardedRef.current is readonly. Let's ignore it
      forwardedRef.current = innerRef.current;
    }
  });

  return innerRef;
};

export default Input;
