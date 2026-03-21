import { Suspense } from "react";
import BookPageClient from "./book-client";
import { apiServer } from "@/services/api-server";
import { requireAuth } from "@/services/auth";

export default async function BookPage() {
  // 🔐 SSR Protection: only authenticated users can book
  await requireAuth();
  const masterData = null;
  return (
    <Suspense fallback={<div className="p-10 text-black font-poppins">Loading booking...</div>}>
      <BookPageClient masterData={masterData} />
    </Suspense>
  );
}
