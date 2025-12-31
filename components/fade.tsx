import { useState, useEffect, cloneElement, JSX } from 'react';

import { cn, cnWhen, when } from '@/lib/util';


/** Child must apply className prop appropriately. */
export function Fade({ revealWhen, children }: {
  revealWhen: boolean,
  children: JSX.Element,
}) {
  const [shouldRenderChild, setShouldRenderChild] = useState(revealWhen);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (revealWhen)
      setShouldRenderChild(true);
    else
      timeout = setTimeout(() => {
        setShouldRenderChild(false);
      }, 190);

    return () => clearTimeout(timeout);
  }, [revealWhen]);

  return when(
    shouldRenderChild,
    cloneElement(children, {
      className: cn(
        children.props.className,
        cnWhen(revealWhen, '', ''),
      ),
    })
  );
}