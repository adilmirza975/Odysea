import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Search,
  Trash2,
  Edit,
  Star,
  Calendar,
  DollarSign,
  Filter,
  ArrowUpDown,
  Heart,
  X,
  Loader2,
  Globe,
  Tag,
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
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { api } from "~/lib/api";
import { cn } from "~/lib/utils";

export function meta() {
  return [
    { title: "Saved Destinations | Odysea" },
    { name: "description", content: "Your travel wishlist" },
  ];
}

interface Destination {
  id: string;
  name: string;
  country: string;
  description?: string;
  imageUrl?: string;
  notes?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  bestSeason?: string;
  estimatedBudget?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    description: "",
    imageUrl: "",
    notes: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    bestSeason: "",
    estimatedBudget: "",
    tags: "",
  });

  useEffect(() => {
    loadDestinations();
  }, [searchQuery, priorityFilter, sortBy, sortOrder]);

  const loadDestinations = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.getDestinations({
        page,
        limit: 12,
        search: searchQuery || undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        sortBy,
        sortOrder,
      });
      setDestinations(response.destinations);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load destinations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDestination(null);
    setFormData({
      name: "",
      country: "",
      description: "",
      imageUrl: "",
      notes: "",
      priority: "MEDIUM",
      bestSeason: "",
      estimatedBudget: "",
      tags: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description || "",
      imageUrl: destination.imageUrl || "",
      notes: destination.notes || "",
      priority: destination.priority,
      bestSeason: destination.bestSeason || "",
      estimatedBudget: destination.estimatedBudget?.toString() || "",
      tags: destination.tags.join(", "),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        country: formData.country,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
        notes: formData.notes || undefined,
        priority: formData.priority,
        bestSeason: formData.bestSeason || undefined,
        estimatedBudget: formData.estimatedBudget ? parseFloat(formData.estimatedBudget) : undefined,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      };

      if (editingDestination) {
        await api.updateDestination(editingDestination.id, data);
      } else {
        await api.createDestination(data);
      }

      setIsModalOpen(false);
      loadDestinations();
    } catch (error) {
      console.error("Failed to save destination:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this destination from your wishlist?")) return;

    try {
      await api.deleteDestination(id);
      setDestinations(destinations.filter(d => d.id !== id));
    } catch (error) {
      console.error("Failed to delete destination:", error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      HIGH: "destructive",
      MEDIUM: "default",
      LOW: "secondary",
    };
    const labels: Record<string, string> = {
      HIGH: "Must Visit",
      MEDIUM: "Want to Visit",
      LOW: "Someday",
    };
    return (
      <Badge variant={variants[priority] || "secondary"}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Destinations</h1>
            <p className="text-muted-foreground">
              Your travel wishlist - places you dream of visiting
            </p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Add Destination
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="HIGH">Must Visit</SelectItem>
              <SelectItem value="MEDIUM">Want to Visit</SelectItem>
              <SelectItem value="LOW">Someday</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Added</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="country">Country</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="estimatedBudget">Budget</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className={cn("h-4 w-4", sortOrder === "desc" && "rotate-180")} />
          </Button>
        </div>

        {/* Destinations Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-muted" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No destinations saved yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your travel wishlist!
              </p>
              <Button onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Destination
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <Card key={destination.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={destination.imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80"}
                      alt={destination.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                      {getPriorityBadge(destination.priority)}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white"
                          onClick={() => openEditModal(destination)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 bg-white/20 hover:bg-red-500/80 text-white"
                          onClick={() => handleDelete(destination.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">{destination.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {destination.country}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {destination.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {destination.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-sm">
                      {destination.bestSeason && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {destination.bestSeason}
                        </div>
                      )}
                      {destination.estimatedBudget && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(destination.estimatedBudget)}
                        </div>
                      )}
                    </div>

                    {destination.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {destination.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {destination.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{destination.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => loadDestinations(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadDestinations(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
            <Card className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editingDestination ? "Edit Destination" : "Add New Destination"}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {editingDestination
                    ? "Update the details of this destination"
                    : "Add a new place to your travel wishlist"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Destination Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Paris"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="e.g., France"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Why do you want to visit this place?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: "LOW" | "MEDIUM" | "HIGH") =>
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HIGH">Must Visit</SelectItem>
                          <SelectItem value="MEDIUM">Want to Visit</SelectItem>
                          <SelectItem value="LOW">Someday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bestSeason">Best Season</Label>
                      <Input
                        id="bestSeason"
                        placeholder="e.g., Spring, Summer"
                        value={formData.bestSeason}
                        onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedBudget">Estimated Budget ($)</Label>
                      <Input
                        id="estimatedBudget"
                        type="number"
                        placeholder="e.g., 3000"
                        value={formData.estimatedBudget}
                        onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., beach, culture, food"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to auto-generate from Unsplash
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Personal Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes about this destination..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>
                </CardContent>

                <div className="flex justify-end gap-2 p-6 pt-0">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingDestination ? "Update" : "Add"} Destination
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
