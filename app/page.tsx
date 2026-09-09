import Experience from "@/components/Experience";
import { Suspense } from "react";
export default function Home() {
  return (
    <Suspense
      fallback={<div className="loading-screen">Growing your garden…</div>}
    >
      <Experience />
    </Suspense>
  );
}
