// src/components/layout/Footer.tsx

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} GoalFlow. All rights reserved.
      </div>
    </footer>
  );
}
