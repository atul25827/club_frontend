import { Suspense } from "react";
import BookPageClient from "./book-client";
import { apiServer } from "@/lib/api-server";

export default async function BookPage() {
  const masterData = null;
  return (
    <Suspense fallback={<div className="p-10 text-black font-poppins">Loading booking...</div>}>
      <BookPageClient masterData={masterData} />
    </Suspense>
  );
}
