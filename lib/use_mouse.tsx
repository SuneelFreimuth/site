import { MouseEventHandler, RefObject, useCallback, useEffect, useRef, useState } from "react";

type Listeners<El extends Element> = Record<string, MouseEventHandler<El> | MouseEventHandler<El>[]>;

export function useMouse<El extends Element>({ ref, listeners }: {
  ref: RefObject<El>;
  listeners: Listeners<El>;
}) {
  const cloneListeners = (listeners: Listeners<El>): Listeners<El> => {
    const listeners_ = {} as Listeners<El>;
    for (const [type, value] of Object.entries(listeners)) {
      if (Array.isArray(value)) {
        listeners_[type] = [...value];
      } else {
        listeners_[type] = value;
      }
    }
    return listeners_;
  };

  const previous = useRef<El>(null);
  const listeners_ = useRef<Listeners<El>>(null);

  const attach = (element: typeof ref.current, ls: Listeners<El>) => {
    if (element === null)
      return;
    for (const [type, value] of Object.entries(ls)) {
      if (Array.isArray(value)) {
        for (const listener of value) {
          element.addEventListener(type, listener as any);
        }
      } else {
        element.addEventListener(type, value as any);
      }
    }
  };

  const dettach = (element: typeof ref.current, ls: Listeners<El>) => {
    if (element === null)
      return;
    for (const [type, value] of Object.entries(ls)) {
      if (Array.isArray(value)) {
        for (const listener of value) {
          element.removeEventListener(type, listener as any);
        }
      } else {
        element.removeEventListener(type, value as any);
      }
    }
  };

  useEffect(() => {
    if (!ref.current)
      return undefined;
    attach(ref.current, listeners);

    return () => {
      dettach(ref.current, listeners);
    };
  }, []);

  useEffect(() => {
    if (listeners !== listeners_.current) {
      if (listeners_.current) {
        dettach(ref.current, listeners_.current);
      }
      attach(ref.current, listeners);
      listeners_.current = cloneListeners(listeners);
    }

    if (ref.current !== previous.current) {
      dettach(previous.current, listeners);
      attach(ref.current, listeners);
      previous.current = ref.current;
    }

    return () => {
      dettach(ref.current, listeners);
      dettach(previous.current, listeners);
    };
  }, [ref.current, listeners]);
}
