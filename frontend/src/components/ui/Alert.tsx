import { forwardRef, HTMLAttributes, ReactNode } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative w-full rounded-lg border p-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>

const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`text-sm [&_p]:leading-relaxed ${className}`}
        {...props}
      />
    );
  }
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription };