import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/90 bg-card p-3.5 shadow-soft",
        className
      )}
      {...props}
    />
  );
}
