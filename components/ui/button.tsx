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
          "bg-gradient-to-r from-primary to-secondary text-white shadow-premium hover:brightness-105 active:scale-[0.99]",
        variant === "secondary" && "bg-[#EEF2FF] text-[#3730A3] hover:bg-[#E0E7FF] active:scale-[0.99]",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-[#EEF2FF] active:scale-[0.99]",
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
