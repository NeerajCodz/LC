import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/cormorant-garamond/300.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";

export const metadata: Metadata = {
  title: {
    default: "Project LC — Living Colors",
    template: "%s — Project LC",
  },
  description:
    "Project LC is on a mission to bring every single flower in the world to life in 3D. Explore an ever-growing collection of interactive botanical specimens.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="current" suppressHydrationWarning>
      <head>
        <script
          id="color-theme"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('living-colors-theme');if(t==='black'||t==='white'||t==='current')document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
