import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref} // C'est ICI la magie : on passe la ref de react-hook-form à l'input natif
        className={cn(
          "h-11 w-full rounded-xl border border-mylegal-cloud bg-white px-3 text-sm text-mylegal-navy outline-none transition focus:border-mylegal-ocean focus:ring-2 focus:ring-mylegal-ocean/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input"; // Bonne pratique avec forwardRef pour les DevTools