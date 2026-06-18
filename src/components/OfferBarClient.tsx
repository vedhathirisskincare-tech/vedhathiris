"use client";

import { usePathname } from "next/navigation";

export default function OfferBarClient({ message }: { message: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="bg-skin-bold text-white text-center py-2 px-4 text-sm font-medium tracking-wide z-50 relative">
      {message}
    </div>
  );
}
