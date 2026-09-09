import type { Metadata } from "next";
import GalleryLoader from "@/components/GalleryLoader";
export const metadata: Metadata = { title: "The collection" };
export default function GalleryPage() {
  return <GalleryLoader />;
}
