"use client";
import dynamic from "next/dynamic";
const Gallery = dynamic(() => import("./Gallery"), {
  ssr: false,
  loading: () => <div className="loading-screen">Growing your collection…</div>,
});
export default function GalleryLoader() {
  return <Gallery />;
}
