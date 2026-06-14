"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      className="back-button"
      type="button"
      onClick={() => router.back()}
      aria-label="Go back to previous page"
    >
      Back
    </button>
  );
}