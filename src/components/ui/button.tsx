'use client';

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    let baseStyles = 'inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer select-none';
    
    let variants = {
      default: 'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10',
      outline: 'border border-border bg-card hover:bg-muted text-foreground/80 hover:text-foreground',
      secondary: 'bg-muted text-foreground hover:bg-muted/80',
      ghost: 'hover:bg-muted text-foreground/80 hover:text-foreground',
      destructive: 'bg-red-600 text-white hover:bg-red-750 shadow-md shadow-red-650/10',
    };

    let sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3 rounded-lg text-[11px]',
      lg: 'h-10 px-8 rounded-xl',
      icon: 'h-9 w-9',
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return <button ref={ref} className={combinedClassName} {...props} />;
  }
);
Button.displayName = 'Button';
