import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Plane,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/lib/api";
import { formatDate, getDaysUntil, formatCurrency } from "~/lib/utils";

export function meta() {
  return [
    { title: "Dashboard | Odysea" },
    { name: "description", content: "Your travel dashboard" },
  ];
}

interface Trip {
  id: string;
  title: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelGroup: string;
  status: string;
  totalEstimate?: number;
}

interface Stats {
  upcoming: number;
  ongoing: number;
  completed: number;
  total: number;
}

export default function DashboardPage() {
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tripsResponse, statsResponse] = await Promise.all([
        api.getUpcomingTrips(),
        api.getTripStats(),
      ]);
      setUpcomingTrips(tripsResponse.trips);
      setStats(statsResponse.stats);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBudgetLabel = (budget: string) => {
    const labels: Record<string, string> = {
      MID_RANGE: "Mid Range",
      LUXURY: "Luxury",
      PREMIUM: "Premium",
    };
    return labels[budget] || budget;
  };

  const getTravelGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      SOLO: "Solo",
      COUPLE: "Couple",
      FRIENDS: "Friends",
      FAMILY: "Family",
    };
    return labels[group] || group;
  };

  const getTravelGroupIcon = (group: string) => {
    return <Users className="h-4 w-4" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your travel plans.
            </p>
          </div>
          <Link to="/dashboard/generate">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate New Trip
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Trips
              </CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcoming ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Adventures awaiting
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ongoing Trips
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.ongoing ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently traveling
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Trips
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completed ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Memories collected
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                All time journeys
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Trips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Trips</h2>
            <Link to="/dashboard/trips">
              <Button variant="ghost" className="gap-2">
                View all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingTrips.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No upcoming trips
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start planning your next adventure with AI-powered trip
                  generation.
                </p>
                <Link to="/dashboard/generate">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate a Trip
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTrips.map((trip) => {
                const daysUntil = getDaysUntil(trip.startDate);
                return (
                  <Link key={trip.id} to={`/dashboard/trips/${trip.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="line-clamp-1">
                              {trip.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {trip.destination}, {trip.country}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={daysUntil <= 7 ? "default" : "secondary"}
                          >
                            {daysUntil === 0
                              ? "Today!"
                              : daysUntil === 1
                              ? "Tomorrow"
                              : `${daysUntil} days`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(trip.startDate)} -{" "}
                              {formatDate(trip.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {getTravelGroupIcon(trip.travelGroup)}
                            <span>{getTravelGroupLabel(trip.travelGroup)}</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{getBudgetLabel(trip.budget)}</span>
                          </div>
                          {trip.totalEstimate && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>
                                Est. {formatCurrency(trip.totalEstimate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
