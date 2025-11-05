import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LetsVet - Pet Health Triage",
  description: "Get quick health assessments for your pets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
