import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Experience from "@/components/Experience";
import { FLOWERS, getFlower, isFlowerType } from "@/lib/flowers/catalog";

type Props = { params: Promise<{ type: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return FLOWERS.map(({ type }) => ({ type }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!isFlowerType(type)) notFound();
  const flower = getFlower(type);
  return { title: flower.name, description: flower.detail };
}
export default async function FlowerPage({ params }: Props) {
  const { type } = await params;
  if (!isFlowerType(type)) notFound();
  return <Experience key={type} initialType={type} />;
}
