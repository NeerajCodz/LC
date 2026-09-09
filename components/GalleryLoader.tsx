"use client";
import dynamic from "next/dynamic";
import { BloomLoader } from "./ui/BloomLoader";
const Gallery = dynamic(() => import("./Gallery"), {
  ssr: false,
  loading: () => <BloomLoader label="Growing your collection…" />,
});
export default function GalleryLoader() {
  return <Gallery />;
}
