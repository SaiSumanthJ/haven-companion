import type { UserFit } from "@/features/companion/userFit";

export function fitsEqual(left: UserFit, right: UserFit): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}
