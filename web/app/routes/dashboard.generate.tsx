import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Sparkles,
  Loader2,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Plane,
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

export function meta() {
  return [
    { title: "Generate Trip | Odysea" },
    { name: "description", content: "Generate AI-powered trip itinerary" },
  ];
}

export default function GenerateTripPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    destination: "",
    country: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelGroup: "",
    preferences: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.destination || !formData.country || !formData.startDate || !formData.endDate || !formData.budget || !formData.travelGroup) {
      setError("Please fill in all required fields");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      setError("End date must be after start date");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.generateTrip({
        destination: formData.destination,
        country: formData.country,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        travelGroup: formData.travelGroup,
        preferences: formData.preferences,
      });

      navigate(`/dashboard/trips/${response.trip.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to generate trip");
    } finally {
      setIsLoading(false);
    }
  };

  const travelGroups = [
    { value: "SOLO", label: "Solo Traveler", description: "Just me" },
    { value: "COUPLE", label: "Couple", description: "Romantic getaway" },
    { value: "FRIENDS", label: "Friends", description: "Group adventure" },
    { value: "FAMILY", label: "Family", description: "Family vacation" },
  ];

  const budgetOptions = [
    { value: "MID_RANGE", label: "Mid Range", description: "$100-200/day" },
    { value: "LUXURY", label: "Luxury", description: "$200-400/day" },
    { value: "PREMIUM", label: "Premium", description: "$400+/day" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Trip Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Let AI create your perfect day-by-day travel itinerary
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>
              Fill in your travel preferences and our AI will generate a
              personalized itinerary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
                  {error}
                </div>
              )}

              {/* Destination */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="destination">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Destination City
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Paris, Tokyo, New York"
                    value={formData.destination}
                    onChange={(e) => handleChange("destination", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., France, Japan, USA"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Departure Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    disabled={isLoading}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Return Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    disabled={isLoading}
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {/* Travel Group */}
              <div className="space-y-2">
                <Label>
                  <Users className="h-4 w-4 inline mr-1" />
                  Who's Traveling?
                </Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {travelGroups.map((group) => (
                    <div
                      key={group.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                        formData.travelGroup === group.value
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-accent"
                      } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                      onClick={() => handleChange("travelGroup", group.value)}
                    >
                      <div>
                        <p className="font-medium">{group.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {group.description}
                        </p>
                      </div>
                      {formData.travelGroup === group.value && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label>
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Budget Range
                </Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {budgetOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                        formData.budget === option.value
                          ? "border-primary bg-primary/5"
                          : "border-input hover:bg-accent"
                      } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                      onClick={() => handleChange("budget", option.value)}
                    >
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {formData.budget === option.value && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <Label htmlFor="preferences">
                  Special Preferences (Optional)
                </Label>
                <Textarea
                  id="preferences"
                  placeholder="e.g., I love museums, prefer outdoor activities, vegetarian food options, avoid crowded places..."
                  value={formData.preferences}
                  onChange={(e) => handleChange("preferences", e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating your perfect trip...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Trip Itinerary
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-3">
              <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Day-by-Day Plans</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed activities for each day
            </p>
          </Card>
          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mb-3">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Cost Estimates</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Budget planning made easy
            </p>
          </Card>
          <Card className="text-center p-6">
            <div className="inline-flex items-center justify-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Personalized</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tailored to your travel style
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
