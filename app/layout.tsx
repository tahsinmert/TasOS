import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TasOS - macOS Simulator",
  description: "Pixel-perfect macOS Sequoia simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
