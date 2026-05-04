import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "markgraf — animated graph diagrams",
  description:
    "Render short animated graph diagrams from a tiny declarative source language. macOS CLI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
