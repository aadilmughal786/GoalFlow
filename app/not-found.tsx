// src/app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react"; // Icon for a sad face

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px-64px)] text-center px-4 py-12 sm:px-6 lg:px-8">
      <Frown className="h-24 w-24 text-primary mb-6" />
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist. It might have been
        moved or deleted.
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
      <Button asChild variant="link" className="mt-4">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
