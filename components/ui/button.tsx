import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function Button({
  className,
  variant = "default",
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" &&
          "bg-gradient-to-r from-mylegal-ocean to-mylegal-navy text-white shadow-premium hover:brightness-105 active:scale-[0.99]",
        variant === "secondary" && "bg-mylegal-pale text-mylegal-navy hover:bg-mylegal-cloud active:scale-[0.99]",
        variant === "ghost" && "bg-transparent text-mylegal-navy hover:bg-mylegal-pale active:scale-[0.99]",
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
