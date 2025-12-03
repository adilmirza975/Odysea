import { Link } from "react-router";
import { Compass, Sparkles, Map, Calendar, Shield, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export function meta() {
  return [
    { title: "Odysea - AI-Powered Travel Planning" },
    { name: "description", content: "Plan your perfect trip with AI-generated day-by-day itineraries" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Compass className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Odysea</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            AI-Powered Travel Planning
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
            Your Perfect Trip,{" "}
            <span className="text-primary">Planned by AI</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Let artificial intelligence create personalized day-by-day itineraries 
            tailored to your travel style, budget, and preferences.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start Planning
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Why Choose Odysea?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Experience the future of travel planning with our intelligent platform
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">AI-Generated Itineraries</h3>
                <p className="mt-2 text-muted-foreground">
                  Get personalized day-by-day plans based on your preferences, 
                  budget, and travel style.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Detailed Activities</h3>
                <p className="mt-2 text-muted-foreground">
                  Every activity includes time slots, locations, and estimated costs 
                  for easy planning.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Trip Management</h3>
                <p className="mt-2 text-muted-foreground">
                  Keep track of all your upcoming and past trips in one organized dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold">Ready to Start Your Adventure?</h2>
              <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
                Join thousands of travelers who plan their trips with AI. 
                Create your free account today.
              </p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="mt-8">
                  Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              <span className="font-semibold">Odysea</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Odysea. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
