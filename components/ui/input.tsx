import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-mylegal-cloud bg-white px-3 text-sm text-mylegal-navy outline-none transition focus:border-mylegal-ocean focus:ring-2 focus:ring-mylegal-ocean/20",
        className
      )}
      {...props}
    />
  );
}
