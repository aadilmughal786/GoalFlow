// src/app/(main)/layout.tsx
import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer"; // Import the new Footer component

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {" "}
      {/* Changed background for subtle contrast */}
      <Header /> {/* Application-wide header */}
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {" "}
        {/* Responsive container with padding */}
        {children}
      </main>
      <Footer /> {/* Application-wide footer */}
    </div>
  );
}
