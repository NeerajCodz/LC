import { notFound } from "next/navigation";
import InspectionLoader from "@/components/InspectionLoader";
export default function InspectionPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <InspectionLoader />;
}
