// src/app/(main)/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Goal,
  CheckCircle2,
  LayoutDashboard,
  Search,
  ArchiveIcon,
  Sun,
  Lightbulb, // Added Lightbulb for Idea Box feature
  Zap, // For Next.js
  Code, // For TypeScript
  Database, // For IndexedDB
  Palette, // For Tailwind CSS
  Feather, // For Lucide React
  CalendarDays, // For Date-fns
  PlusSquare, // For step 1: Define Goal
  ListChecks, // For step 2: Track Subtasks
  TrendingUp,
  User,
  Github,
  Linkedin,
  Globe, // For step 3: Achieve & Review
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px-64px)] text-center px-4 py-12 sm:px-6 lg:px-8">
      {" "}
      {/* Adjusted min-height for header and footer */}
      <div className="max-w-3xl mx-auto space-y-8">
        <Goal className="h-24 w-24 text-primary mx-auto animate-bounce-slow" />{" "}
        {/* Animated Goal Icon */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Achieve Your Goals with <span className="text-primary">GoalFlow</span>
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          GoalFlow is your personal, intuitive, and powerful goal tracker
          designed to help you break down your aspirations, track progress, and
          stay motivated.
        </p>
        {/* Added personal philosophy statement */}
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          I believe in the philosophy of building one thing for a specific
          purpose, and building that one thing exceptionally well. GoalFlow is
          built with this principle in mind: to provide a focused,
          distraction-free environment solely dedicated to helping you achieve
          your goals.
        </p>
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <FeatureCard
            icon={<LayoutDashboard className="h-8 w-8 text-primary" />}
            title="Intuitive Dashboard"
            description="Get a clear overview of all your goals, their progress, and deadlines at a glance."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-8 w-8 text-primary" />}
            title="Detailed Subtasks"
            description="Break down large goals into manageable subtasks and track completion with ease."
          />
          <FeatureCard
            icon={<Lightbulb className="h-8 w-8 text-primary" />} // Feature for Idea Box
            title="Idea Box"
            description="Capture fleeting ideas and transform them into actionable goals later."
          />
          <FeatureCard
            icon={<Search className="h-8 w-8 text-primary" />}
            title="Smart Search & Filters"
            description="Quickly find any goal using fuzzy search and powerful filtering options."
          />
          <FeatureCard
            icon={<ArchiveIcon className="h-8 w-8 text-primary" />}
            title="Archive & Organize"
            description="Keep your active list clean by archiving completed or inactive goals, easily retrievable later."
          />
          <FeatureCard
            icon={<Sun className="h-8 w-8 text-primary" />}
            title="Dark & Light Mode"
            description="Switch between themes for a comfortable viewing experience, day or night."
          />
        </div>
        {/* Call to Action */}
        <div className="mt-12">
          <Button
            asChild
            size="lg"
            className="px-8 py-3 text-lg font-semibold shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <Link href="/dashboard">Try GoalFlow Now</Link>
          </Button>
        </div>
        {/* New: How It Works Section */}
        <div className="mt-16 pt-12 border-t border-muted-foreground/20 space-y-8">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            How GoalFlow <span className="text-primary">Works</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started on your journey to success in three simple steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <HowItWorksCard
              step="1"
              icon={<PlusSquare className="h-10 w-10 text-primary" />}
              title="Define Your Goal"
              description="Clearly articulate your aspirations and set a target date. Give your goal a unique icon to make it stand out!"
            />
            <HowItWorksCard
              step="2"
              icon={<ListChecks className="h-10 w-10 text-primary" />}
              title="Break It Down"
              description="Divide your main goal into smaller, actionable subtasks. Track each one to build momentum."
            />
            <HowItWorksCard
              step="3"
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Track & Achieve"
              description="Monitor your progress at a glance. Watch your goals move from active to completed, celebrating every milestone."
            />
          </div>
        </div>
        {/* New: Idea Box Section */}
        <div className="mt-16 pt-12 border-t border-muted-foreground/20 space-y-8">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl flex items-center justify-center gap-4">
            <Lightbulb className="h-12 w-12 text-primary" /> The{" "}
            <span className="text-primary">Idea Box</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Great ideas can strike at any moment. GoalFlow's Idea Box is a
            dedicated space to quickly jot down those fleeting thoughts,
            brilliant concepts, or potential goals before they vanish. It's a
            low-friction way to capture inspiration, allowing you to organize
            and develop them into actionable goals whenever you're ready. Never
            lose a good idea again!
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg font-semibold shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <Link href="/dashboard">Explore the Idea Box</Link>
            </Button>
          </div>
        </div>
        {/* Development Details Section */}
        <div className="mt-16 pt-12 border-t border-muted-foreground/20 space-y-8">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Built with Passion &{" "}
            <span className="text-primary">Modern Tech</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            GoalFlow is crafted using a stack of cutting-edge and reliable
            technologies, ensuring a fast, secure, and delightful user
            experience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <TechStackCard
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Next.js"
              description="A powerful React framework for building fast and scalable web applications."
            />
            <TechStackCard
              icon={<Code className="h-8 w-8 text-primary" />}
              title="TypeScript"
              description="Adds strong typing to JavaScript, enhancing code quality and developer productivity."
            />
            <TechStackCard
              icon={<Database className="h-8 w-8 text-primary" />}
              title="IndexedDB"
              description="For robust and efficient client-side data storage, ensuring your goals are always available."
            />
            <TechStackCard
              icon={<Palette className="h-8 w-8 text-primary" />}
              title="Tailwind CSS"
              description="A utility-first CSS framework for rapidly building custom designs."
            />
            <TechStackCard
              icon={<Feather className="h-8 w-8 text-primary" />}
              title="Lucide React"
              description="Beautifully simple and consistent open-source icons for a polished UI."
            />
            <TechStackCard
              icon={<CalendarDays className="h-8 w-8 text-primary" />}
              title="Date-fns"
              description="A modern JavaScript date utility library for easy and efficient date manipulation."
            />
          </div>
        </div>
        {/* Author Details Section */}
        <section className="space-y-4 text-center pt-8 border-t border-muted-foreground/20">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-foreground justify-center">
            <User className="h-7 w-7 text-primary" /> About the Author
          </h2>
          <p className="text-lg text-muted-foreground">
            GoalFlow is developed by Aadil Mughal.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link
              href="https://github.com/aadilmughal786"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-8 w-8" />
              <span className="sr-only">GitHub Profile</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/aadil-mugal-146bb818a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-8 w-8" />
              <span className="sr-only">LinkedIn Profile</span>
            </Link>
            <Link
              href="https://aadilmughal786.github.io/portfolio-new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="h-8 w-8" />
              <span className="sr-only">Personal Website</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 space-y-4">
      {icon}
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}

interface TechStackCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function TechStackCard({ icon, title, description }: TechStackCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-secondary rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 space-y-4">
      {icon}
      <h3 className="text-xl font-semibold text-secondary-foreground">
        {title}
      </h3>
      <p className="text-secondary-foreground/80 text-center">{description}</p>
    </div>
  );
}

interface HowItWorksCardProps {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function HowItWorksCard({
  step,
  icon,
  title,
  description,
}: HowItWorksCardProps) {
  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 space-y-4">
      <div className="relative flex items-center justify-center h-16 w-16 mb-2">
        <span className="absolute -top-4 -left-4 text-5xl font-extrabold text-primary/20 opacity-50 select-none">
          {step}
        </span>
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}
