"use client";
import dynamic from "next/dynamic";
import { BloomLoader } from "./ui/BloomLoader";
const Inspection = dynamic(() => import("./Inspection"), {
  ssr: false,
  loading: () => <BloomLoader label="Preparing the specimens…" />,
});
export default function InspectionLoader() {
  return <Inspection />;
}
