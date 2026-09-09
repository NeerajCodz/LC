"use client";
import dynamic from "next/dynamic";
const Inspection = dynamic(() => import("./Inspection"), { ssr: false });
export default function InspectionLoader() {
  return <Inspection />;
}
