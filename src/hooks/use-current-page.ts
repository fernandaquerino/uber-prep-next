"use client";

import { NAV_GROUPS } from "@/shared/constants/navigation";
import { usePathname } from "next/navigation";

export function useCurrentPage() {
  const pathname = usePathname();

  const currentPage = NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return currentPage;
}
