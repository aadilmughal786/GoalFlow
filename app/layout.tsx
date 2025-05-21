// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConfirmDialogProvider } from "@/lib/hooks/useConfirmProvider"; // Import the provider

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoalFlow - Your Personal Goal Tracker",
  description: "Track and achieve your goals with GoalFlow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <ConfirmDialogProvider>
            {" "}
            {/* Wrap children with the provider */}
            {children}
          </ConfirmDialogProvider>
        </div>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
