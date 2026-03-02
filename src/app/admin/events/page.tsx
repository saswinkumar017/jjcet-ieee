"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminEventsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/events");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
