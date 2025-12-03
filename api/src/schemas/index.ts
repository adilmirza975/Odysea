import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createTripSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  destination: z.string().min(1, "Destination is required"),
  country: z.string().min(1, "Country is required"),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  budget: z.enum(["MID_RANGE", "LUXURY", "PREMIUM"]),
  travelGroup: z.enum(["SOLO", "COUPLE", "FRIENDS", "FAMILY"]),
  coverImage: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});

export const generateTripSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  country: z.string().min(1, "Country is required"),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.enum(["MID_RANGE", "LUXURY", "PREMIUM"]),
  travelGroup: z.enum(["SOLO", "COUPLE", "FRIENDS", "FAMILY"]),
  preferences: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type GenerateTripInput = z.infer<typeof generateTripSchema>;
