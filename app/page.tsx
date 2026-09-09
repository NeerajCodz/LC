import Experience from "@/components/Experience";
import { permanentRedirect } from "next/navigation";
import { isFlowerType } from "@/lib/flowers/catalog";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ flower?: string | string[] }>;
}) {
  const { flower } = await searchParams;
  if (isFlowerType(flower)) permanentRedirect(`/flower/${flower}`);
  return <Experience initialType="rose" />;
}
