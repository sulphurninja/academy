"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_14px_rgba(16,185,129,0.25)]",
        gold:
          "text-[#1a1100] bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 ring-1 ring-amber-300 hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 gold-glow",
        outline:
          "border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-emerald-300 bg-white",
        ghost: "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
        soft:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
