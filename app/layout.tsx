import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krillion",
  description: "A daily descent through the rarest answers.",
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
