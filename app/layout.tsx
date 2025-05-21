// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ConfirmProvider } from "@/lib/hooks/useConfirmProvider";
import { ThemeProvider } from "@/components/theme-provider"; // Import ThemeProvider

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
        <ThemeProvider
          attribute="class" // Adds "dark" or "light" class to the html element
          defaultTheme="system" // Default theme: system, dark, or light
          enableSystem // Enable system theme detection
          disableTransitionOnChange // Disable theme transition on change
        >
          <div className="min-h-screen bg-background font-sans antialiased">
            <ConfirmProvider>{children}</ConfirmProvider>
          </div>
          <Toaster richColors position="bottom-left" />
        </ThemeProvider>
      </body>
    </html>
  );
}
