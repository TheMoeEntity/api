import type { Metadata } from "next";

import { Nav } from "@/components/nav";
import type { LayoutProps } from "@/types/component.types";

import "./globals.css";

export const metadata: Metadata = {
  title: "Refund Desk",
  description: "AI-assisted refund requests with policy-based decisions",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
