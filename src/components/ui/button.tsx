import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Dark navy - subtle opacity on hover
        default: "bg-primary text-white shadow-sm hover:opacity-90 transition-opacity duration-150",
        // Destructive: Red - subtle opacity on hover
        destructive: "bg-destructive text-white hover:opacity-90 transition-opacity duration-150",
        // Outline: Navy border - subtle background tint on hover
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary/5 transition-colors duration-150",
        // Secondary: Soft blue - subtle opacity on hover
        secondary: "bg-secondary text-white hover:opacity-90 transition-opacity duration-150",
        // Ghost: Transparent - subtle gray on hover
        ghost: "bg-transparent hover:bg-black/5 transition-colors duration-150",
        // Link: Blue text - subtle underline on hover
        link: "text-secondary underline-offset-4 hover:underline transition-all duration-150",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
