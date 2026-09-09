import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";

export const metadata: Metadata = {
  title: {
    default: "Living Colors — A study in bloom",
    template: "%s — Living Colors",
  },
  description:
    "A living collection of fifteen sculptural flowers. Explore their forms, unfold each petal, and find a moment of stillness.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
