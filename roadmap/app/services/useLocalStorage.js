import { useEffect, useRef, useState } from "react";

const parseStoredValue = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;
  const storedItem = window?.localStorage.getItem(key);
  if (storedItem == null) return defaultValue;
  if (typeof defaultValue === "string") return JSON.parse(storedItem);
  if (typeof defaultValue === "number") return Number(JSON.parse(storedItem));
  return JSON.parse(storedItem);
};

export const useLocalStorage = (key, defaultValue = undefined) => {
  const [state, setState] = useState(defaultValue);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      setState(() => parseStoredValue(key, defaultValue));
    } else {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  useEffect(() => {
    if (isMounted.current === true) {
      isMounted.current = false;
      setState(() => parseStoredValue(key, defaultValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    window.addEventListener(`storage-${key}`, () =>
      setState(() => parseStoredValue(key, defaultValue))
    );
  });

  return [state, setState];
};

export const useSetLocalStorage = (key) => {
  const setStateAndDispatchEvent = (newValue) => {
    window.localStorage.setItem(key, JSON.stringify(newValue));
    window.dispatchEvent(new Event(`storage-${key}`));
  };

  return setStateAndDispatchEvent;
};
