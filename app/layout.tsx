import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Absence Tracker",
  description: "Track student absences efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
