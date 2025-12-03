const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface ApiOptions extends RequestInit {
  data?: any;
}

interface TripFilters {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  budget?: string;
  travelGroup?: string;
  destination?: string;
  country?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

interface ActivityFilters {
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minCost?: number;
  maxCost?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { data, headers: customHeaders, ...customOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...customOptions,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Request failed");
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name: string }) {
    return this.request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      data,
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      data,
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>("/auth/me");
  }

  // Trip endpoints with advanced filtering, sorting, and search
  async getTrips(params?: TripFilters) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.budget) searchParams.set("budget", params.budget);
    if (params?.travelGroup) searchParams.set("travelGroup", params.travelGroup);
    if (params?.destination) searchParams.set("destination", params.destination);
    if (params?.country) searchParams.set("country", params.country);
    if (params?.startDateFrom) searchParams.set("startDateFrom", params.startDateFrom);
    if (params?.startDateTo) searchParams.set("startDateTo", params.startDateTo);

    const query = searchParams.toString();
    return this.request<{ trips: any[]; pagination: any; filters: any }>(`/trips${query ? `?${query}` : ""}`);
  }

  async getUpcomingTrips() {
    return this.request<{ trips: any[] }>("/trips/upcoming");
  }

  async getTrip(id: string) {
    return this.request<{ trip: any }>(`/trips/${id}`);
  }

  async createTrip(data: any) {
    return this.request<{ trip: any }>("/trips", {
      method: "POST",
      data,
    });
  }

  async updateTrip(id: string, data: any) {
    return this.request<{ trip: any }>(`/trips/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteTrip(id: string) {
    return this.request<{ message: string }>(`/trips/${id}`, {
      method: "DELETE",
    });
  }

  async getTripStats() {
    return this.request<{ stats: any }>("/trips/stats/overview");
  }

  // Activity endpoints
  async getActivities(tripId: string, dayId: string, params?: ActivityFilters) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.minCost) searchParams.set("minCost", params.minCost.toString());
    if (params?.maxCost) searchParams.set("maxCost", params.maxCost.toString());

    const query = searchParams.toString();
    return this.request<{ activities: any[] }>(
      `/activities/trip/${tripId}/day/${dayId}${query ? `?${query}` : ""}`
    );
  }

  async getActivity(id: string) {
    return this.request<{ activity: any }>(`/activities/${id}`);
  }

  async createActivity(tripId: string, dayId: string, data: any) {
    return this.request<{ activity: any }>(`/activities/trip/${tripId}/day/${dayId}`, {
      method: "POST",
      data,
    });
  }

  async updateActivity(id: string, data: any) {
    return this.request<{ activity: any }>(`/activities/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteActivity(id: string) {
    return this.request<{ message: string }>(`/activities/${id}`, {
      method: "DELETE",
    });
  }

  async reorderActivities(tripId: string, dayId: string, activityIds: string[]) {
    return this.request<{ activities: any[] }>(
      `/activities/trip/${tripId}/day/${dayId}/reorder`,
      {
        method: "PUT",
        data: { activityIds },
      }
    );
  }

  async bulkCreateActivities(tripId: string, dayId: string, activities: any[]) {
    return this.request<{ message: string; activities: any[] }>(
      `/activities/trip/${tripId}/day/${dayId}/bulk`,
      {
        method: "POST",
        data: { activities },
      }
    );
  }

  // Saved Destinations endpoints
  async getDestinations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    priority?: string;
    country?: string;
    tag?: string;
    minBudget?: number;
    maxBudget?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.country) searchParams.set("country", params.country);
    if (params?.tag) searchParams.set("tag", params.tag);
    if (params?.minBudget) searchParams.set("minBudget", params.minBudget.toString());
    if (params?.maxBudget) searchParams.set("maxBudget", params.maxBudget.toString());

    const query = searchParams.toString();
    return this.request<{ destinations: any[]; pagination: any; filters: any }>(
      `/destinations${query ? `?${query}` : ""}`
    );
  }

  async getDestination(id: string) {
    return this.request<{ destination: any }>(`/destinations/${id}`);
  }

  async createDestination(data: {
    name: string;
    country: string;
    description?: string;
    imageUrl?: string;
    notes?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    bestSeason?: string;
    estimatedBudget?: number;
    tags?: string[];
  }) {
    return this.request<{ destination: any }>("/destinations", {
      method: "POST",
      data,
    });
  }

  async updateDestination(id: string, data: Partial<{
    name: string;
    country: string;
    description?: string;
    imageUrl?: string;
    notes?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    bestSeason?: string;
    estimatedBudget?: number;
    tags?: string[];
  }>) {
    return this.request<{ destination: any }>(`/destinations/${id}`, {
      method: "PUT",
      data,
    });
  }

  async deleteDestination(id: string) {
    return this.request<{ message: string }>(`/destinations/${id}`, {
      method: "DELETE",
    });
  }

  async getDestinationStats() {
    return this.request<{ stats: any }>("/destinations/stats/overview");
  }

  // AI endpoints
  async generateTrip(data: {
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    budget: string;
    travelGroup: string;
    preferences?: string;
  }) {
    return this.request<{ trip: any }>("/ai/generate", {
      method: "POST",
      data,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
