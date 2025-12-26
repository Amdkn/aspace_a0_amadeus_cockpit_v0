import type { Metadata } from "next";
import "./globals.css";
import { OSProvider } from "@/components/os/WindowManager";

export const metadata: Metadata = {
  title: "A'Space OS V4 - Solarpunk Edition",
  description: "A'Space Operating System - Nature + High Tech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <OSProvider>{children}</OSProvider>
      </body>
    </html>
  );
}
