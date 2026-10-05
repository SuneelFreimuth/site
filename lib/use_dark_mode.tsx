import { useEffect, useState } from "react";

export function useDarkMode() {
  const [darkModeOn, setDarkModeOn] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkModeOn(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setDarkModeOn(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return { darkModeOn };
}