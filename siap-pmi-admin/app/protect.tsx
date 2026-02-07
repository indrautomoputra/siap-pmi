"use client";
import { usePathname } from "next/navigation";
import AuthGuard from "../components/AuthGuard";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === "/login";
  if (isPublic) return <>{children}</>;
  return <AuthGuard>{children}</AuthGuard>;
}
