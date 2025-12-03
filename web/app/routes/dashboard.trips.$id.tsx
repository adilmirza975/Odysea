import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Trash2,
  DollarSign,
  Utensils,
  Camera,
  ShoppingBag,
  Car,
  Hotel,
  Activity,
  CircleDot,
  Edit,
  X,
  Loader2,
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
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/lib/api";
import { formatDate, formatCurrency, getTripDuration, cn } from "~/lib/utils";

export function meta() {
  return [
    { title: "Trip Details | Odysea" },
    { name: "description", content: "View your trip details" },
  ];
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  estimatedCost?: number;
  category: string;
  order: number;
}

interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  description?: string;
  activities: Activity[];
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
  itineraryDays: ItineraryDay[];
}

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
    budget: "",
    travelGroup: "",
  });

  useEffect(() => {
    if (id) {
      loadTrip(id);
    }
  }, [id]);

  useEffect(() => {
    if (trip) {
      setEditForm({
        title: trip.title,
        description: trip.description || "",
        status: trip.status,
        budget: trip.budget,
        travelGroup: trip.travelGroup,
      });
    }
  }, [trip]);

  const loadTrip = async (tripId: string) => {
    try {
      const response = await api.getTrip(tripId);
      setTrip(response.trip);
    } catch (error) {
      console.error("Failed to load trip:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!trip) return;

    setIsUpdating(true);
    try {
      const response = await api.updateTrip(trip.id, editForm);
      setTrip(response.trip);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update trip:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!trip || !confirm("Are you sure you want to delete this trip?")) return;

    try {
      await api.deleteTrip(trip.id);
      navigate("/dashboard/trips");
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
    const variants: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      TRANSPORT: <Car className="h-4 w-4" />,
      ACCOMMODATION: <Hotel className="h-4 w-4" />,
      FOOD: <Utensils className="h-4 w-4" />,
      SIGHTSEEING: <Camera className="h-4 w-4" />,
      ACTIVITY: <Activity className="h-4 w-4" />,
      SHOPPING: <ShoppingBag className="h-4 w-4" />,
      OTHER: <CircleDot className="h-4 w-4" />,
    };
    return icons[category] || icons.OTHER;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      TRANSPORT: "bg-blue-500",
      ACCOMMODATION: "bg-purple-500",
      FOOD: "bg-orange-500",
      SIGHTSEEING: "bg-green-500",
      ACTIVITY: "bg-pink-500",
      SHOPPING: "bg-yellow-500",
      OTHER: "bg-gray-500",
    };
    return colors[category] || colors.OTHER;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-48 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!trip) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Trip not found</h2>
          <p className="text-muted-foreground mb-4">
            The trip you're looking for doesn't exist.
          </p>
          <Link to="/dashboard/trips">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to trips
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const duration = getTripDuration(trip.startDate, trip.endDate);
  const currentDay = trip.itineraryDays.find((d) => d.dayNumber === activeDay);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Link to="/dashboard/trips">
          <Button variant="ghost" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to trips
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
              {getStatusBadge(trip.status)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {trip.destination}, {trip.country}
              </span>
            </div>
            {trip.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {trip.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Edit Trip
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleDeleteTrip}
            >
              <Trash2 className="h-4 w-4" />
              Delete Trip
            </Button>
          </div>
        </div>

        {/* Trip Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="font-medium">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{duration} days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Travel Group</p>
                <p className="font-medium">
                  {getTravelGroupLabel(trip.travelGroup)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">
                  {getBudgetLabel(trip.budget)}
                  {trip.totalEstimate && (
                    <span className="text-muted-foreground text-sm ml-1">
                      ({formatCurrency(trip.totalEstimate)})
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Destination Images */}
        {trip.images && trip.images.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Destination Gallery</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {trip.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden group"
                >
                  <img
                    src={image}
                    alt={`${trip.destination} - Image ${index + 1}`}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Day-by-Day Itinerary</h2>

          {trip.itineraryDays.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">
                  No itinerary available for this trip.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
              {/* Day selector */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                {trip.itineraryDays.map((day) => (
                  <Button
                    key={day.id}
                    variant={activeDay === day.dayNumber ? "default" : "outline"}
                    className="justify-start shrink-0"
                    onClick={() => setActiveDay(day.dayNumber)}
                  >
                    <span className="font-medium">Day {day.dayNumber}</span>
                    <span className="ml-2 text-xs opacity-70">
                      {formatDate(day.date)}
                    </span>
                  </Button>
                ))}
              </div>

              {/* Day content */}
              {currentDay && (
                <Card>
                  <CardHeader>
                    <CardTitle>{currentDay.title}</CardTitle>
                    {currentDay.description && (
                      <CardDescription>{currentDay.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentDay.activities.map((activity, index) => (
                        <div key={activity.id} className="relative pl-6">
                          {/* Timeline connector */}
                          {index < currentDay.activities.length - 1 && (
                            <div className="absolute left-[9px] top-6 bottom-0 w-[2px] bg-border" />
                          )}
                          
                          {/* Activity card */}
                          <div className="flex gap-4">
                            {/* Category icon */}
                            <div
                              className={cn(
                                "absolute left-0 flex h-5 w-5 items-center justify-center rounded-full text-white shrink-0",
                                getCategoryColor(activity.category)
                              )}
                            >
                              {getCategoryIcon(activity.category)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-medium">{activity.title}</h4>
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {activity.description}
                                    </p>
                                  )}
                                </div>
                                {activity.estimatedCost && (
                                  <Badge variant="outline" className="shrink-0">
                                    {formatCurrency(activity.estimatedCost)}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                {activity.startTime && activity.endTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {activity.startTime} - {activity.endTime}
                                    </span>
                                  </div>
                                )}
                                {activity.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsEditModalOpen(false)}
          />
          <Card className="relative z-50 w-full max-w-lg mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Trip</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Update the details of your trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Trip title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Trip description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-budget">Budget</Label>
                  <Select
                    value={editForm.budget}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, budget: value })
                    }
                  >
                    <SelectTrigger id="edit-budget">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUDGET">Budget</SelectItem>
                      <SelectItem value="MID_RANGE">Mid Range</SelectItem>
                      <SelectItem value="LUXURY">Luxury</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-travel-group">Travel Group</Label>
                  <Select
                    value={editForm.travelGroup}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, travelGroup: value })
                    }
                  >
                    <SelectTrigger id="edit-travel-group">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SOLO">Solo</SelectItem>
                      <SelectItem value="COUPLE">Couple</SelectItem>
                      <SelectItem value="FRIENDS">Friends</SelectItem>
                      <SelectItem value="FAMILY">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateTrip} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
