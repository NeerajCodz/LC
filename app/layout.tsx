import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Living Colors — A study in bloom", template: "%s — Living Colors" },
  description: "A living collection of fifteen sculptural flowers. Explore their forms, unfold each petal, and find a moment of stillness.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
