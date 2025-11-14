import { forwardRef, HTMLAttributes } from 'react';

type SeparatorProps = HTMLAttributes<HTMLDivElement>

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`shrink-0 bg-border h-[1px] w-full ${className}`}
        {...props}
      />
    );
  }
);

Separator.displayName = 'Separator';

export { Separator };