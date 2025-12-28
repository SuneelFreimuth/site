"use client";

import { useLayoutEffect } from "react";
import { useEffect, useState } from "react";

export function useViewportSize() {
  const [viewportSize, setViewportSize] = useState({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const onWindowResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    onWindowResize();
    window.addEventListener("resize", onWindowResize);
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return viewportSize;
}
