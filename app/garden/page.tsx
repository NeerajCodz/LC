import type { Metadata } from "next";
import Garden from "@/components/Garden";
export const metadata: Metadata = { title: "The garden" };
export default function GardenPage() {
  return <Garden />;
}
