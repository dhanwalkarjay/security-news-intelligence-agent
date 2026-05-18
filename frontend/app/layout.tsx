import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security News Intelligence Agent",
  description: "Cybersecurity news crawler, AI summaries, and job recommendations.",
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
