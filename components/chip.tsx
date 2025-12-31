import { ComponentProps, CSSProperties, StyleHTMLAttributes } from 'react';
import { cn, isSome } from '@/lib/util';
import clsx from 'clsx';


export function Chip({
  className,
  children,
  fgColor = '#000',
  bgColor = '#FFF',
  onClick,
  style,
  ...props
}: ComponentProps<'span'> & {
  fgColor?: string;
  bgColor?: string;
}) {
  return (
    <span
      className={clsx(
        className,
        'inline-block px-2 py-1 rounded-full text-md select-none',
      )}
      onClick={onClick}
      style={{
        color: fgColor,
        backgroundColor: bgColor,
        cursor: isSome(onClick) ?  'pointer' : 'unset',
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}