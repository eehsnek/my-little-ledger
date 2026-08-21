import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Utang Tracker — Track debts and loans simply" },
      { name: "description", content: "A simple tool to track money you lent and money you borrowed." },
      { property: "og:title", content: "Utang Tracker — Track debts and loans simply" },
      { property: "og:description", content: "A simple tool to track money you lent and money you borrowed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Utang Tracker
        </h1>
        <p className="text-lg text-muted-foreground">
          Keep track of money you lent and money you borrowed — all in one simple place.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
