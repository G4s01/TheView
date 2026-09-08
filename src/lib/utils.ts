import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WithoutChild<T> = Omit<T, "child">;
export type WithoutChildrenOrChild<T> = Omit<
  T,
  "children" | "child" | "children[]"
>;
export type WithElementRef<T, Ref = HTMLElement> = T & { ref?: Ref | null };
