import { useEffect, useRef } from "react";

const useSetDocumentTitle = (title, { isVisible = true } = {}) => {
  const previousTitle = useRef(null);
  useEffect(() => {
    if (isVisible) {
      previousTitle.current = document.title;
      document.title = title;
    } else {
      document.title = previousTitle.current;
    }
    return () => (document.title = previousTitle.current);
  }, [isVisible, title]);

  return null;
};

export default useSetDocumentTitle;
