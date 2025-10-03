// useUIElement.tsx
import { useEffect, useState } from "react";

export const useUIElement = ({ type, className }: { type: string; className?: string }) => {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll(`${type}${className ? `.${className}` : ''}`);
    const firstElement = elements[0] as HTMLElement | undefined;

    if (firstElement) {
      setElement(firstElement);
    }
  }, [type, className]);

  return element;
};
