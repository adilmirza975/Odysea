import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  MapPin,
  Users,
  Plane,
  Clock,
  Search,
  Filter,
  Trash2,
  Eye,
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/lib/api";
import { formatDate, formatCurrency, getTripDuration } from "~/lib/utils";

export function meta() {
  return [
    { title: "All Trips | Odysea" },
    { name: "description", content: "View all your trips" },
  ];
}

interface Trip {
  id: string;
  title: string;
  description?: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelGroup: string;
  status: string;
  totalEstimate?: number;
  coverImage?: string;
  images?: string[];
  itineraryDays?: any[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AllTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reload trips when tab or search changes
  useEffect(() => {
    loadTrips(1);
  }, [activeTab, debouncedSearch]);

  const loadTrips = async (page = 1) => {
    setIsLoading(true);
    try {
      const status = activeTab !== "all" ? activeTab.toUpperCase() : undefined;
      const response = await api.getTrips({
        status,
        page,
        limit: 3,
        search: debouncedSearch || undefined,
      });
      setTrips(response.trips);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load trips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      await api.deleteTrip(id);
      setTrips(trips.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete trip:", error);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "success" | "warning" | "destructive"
    > = {
      UPCOMING: "default",
      ONGOING: "warning",
      COMPLETED: "success",
      CANCELLED: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Trips</h1>
            <p className="text-muted-foreground">
              Manage and view all your travel adventures
            </p>
          </div>
          <Link to="/dashboard/generate">
            <Button className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate New Trip
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
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
            ) : trips.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Start planning your adventures today!"}
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
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => {
                    const duration = getTripDuration(
                      trip.startDate,
                      trip.endDate
                    );
                    return (
                      <Card
                        key={trip.id}
                        className="group hover:shadow-lg transition-shadow overflow-hidden"
                      >
                        {/* Cover Image */}
                        {trip.coverImage && (
                          <div className="relative h-40 overflow-hidden">
                            <img
                              src={trip.coverImage}
                              alt={trip.destination}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-3 right-3">
                              {getStatusBadge(trip.status)}
                            </div>
                          </div>
                        )}
                        <CardHeader className={trip.coverImage ? "pt-3" : ""}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                                {trip.title}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {trip.destination}, {trip.country}
                              </CardDescription>
                            </div>
                            {!trip.coverImage && getStatusBadge(trip.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {trip.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {trip.description}
                              </p>
                            )}
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {formatDate(trip.startDate)} -{" "}
                                  {formatDate(trip.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{duration} days</span>
                                <span className="text-muted-foreground/50">
                                  •
                                </span>
                                <span>
                                  {trip.itineraryDays?.length || 0} activities
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>
                                  {getTravelGroupLabel(trip.travelGroup)}
                                </span>
                                <span className="text-muted-foreground/50">
                                  •
                                </span>
                                <span>{getBudgetLabel(trip.budget)}</span>
                              </div>
                              {trip.totalEstimate && (
                                <div className="flex items-center gap-2 font-medium">
                                  <span>
                                    Est. {formatCurrency(trip.totalEstimate)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <Link
                                to={`/dashboard/trips/${trip.id}`}
                                className="flex-1"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteTrip(trip.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => loadTrips(pagination.page - 1)}
                    >
                      Previous
                    </Button>

                    {/* Page numbers */}
                    {(() => {
                      const pages: (number | string)[] = [];
                      const currentPage = pagination.page;
                      const totalPages = pagination.totalPages;

                      // Always show first page
                      pages.push(1);

                      // Add ellipsis after first page if needed
                      if (currentPage > 3) {
                        pages.push("...");
                      }

                      // Add pages around current page
                      for (
                        let i = Math.max(2, currentPage - 1);
                        i <= Math.min(totalPages - 1, currentPage + 1);
                        i++
                      ) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }

                      // Add ellipsis before last page if needed
                      if (currentPage < totalPages - 2) {
                        pages.push("...");
                      }

                      // Always show last page if more than 1 page
                      if (totalPages > 1 && !pages.includes(totalPages)) {
                        pages.push(totalPages);
                      }

                      return pages.map((page, index) =>
                        typeof page === "string" ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-muted-foreground"
                          >
                            {page}
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            className="min-w-[36px]"
                            onClick={() => loadTrips(page)}
                          >
                            {page}
                          </Button>
                        )
                      );
                    })()}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => loadTrips(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
