import { useEffect, useRef } from "react";

interface UseDocumentTitleOptions {
  restoreOnUnmount?: boolean;
}

export function useDocumentTitle(
  title: string,
  options: UseDocumentTitleOptions = {}
) {
  const { restoreOnUnmount = false } = options;
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    document.title = title;

    return () => {
      if (restoreOnUnmount) {
        document.title = defaultTitle.current;
      }
    };
  }, [title, restoreOnUnmount]);
}
