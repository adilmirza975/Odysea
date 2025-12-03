import { Router, type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schemas
const createActivitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  estimatedCost: z.number().optional(),
  category: z.enum(["TRANSPORT", "ACCOMMODATION", "FOOD", "SIGHTSEEING", "ACTIVITY", "SHOPPING", "OTHER"]),
  order: z.number().optional(),
});

const updateActivitySchema = createActivitySchema.partial();

// Helper function to verify trip ownership
async function verifyTripOwnership(tripId: string, userId: string): Promise<boolean> {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
  });
  return !!trip;
}

// Get all activities for a trip day
router.get("/trip/:tripId/day/:dayId", async (req: Request, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const dayId = req.params.dayId as string;
    const { 
      category, 
      search,
      sortBy = "order",
      sortOrder = "asc",
      minCost,
      maxCost
    } = req.query;

    // Verify trip ownership
    if (!(await verifyTripOwnership(tripId, req.user!.userId))) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Build where clause
    const where: any = { itineraryDayId: dayId };
    
    // Category filter
    if (category) {
      where.category = category;
    }
    
    // Cost range filter
    if (minCost || maxCost) {
      where.estimatedCost = {};
      if (minCost) {
        where.estimatedCost.gte = parseFloat(minCost as string);
      }
      if (maxCost) {
        where.estimatedCost.lte = parseFloat(maxCost as string);
      }
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { location: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const validSortFields = ["order", "startTime", "endTime", "estimatedCost", "title"];
    const orderByField = validSortFields.includes(sortBy as string) ? sortBy : "order";
    const orderByDirection = sortOrder === "desc" ? "desc" : "asc";

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { [orderByField as string]: orderByDirection },
    });

    res.json({ activities });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single activity
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        itineraryDay: {
          include: {
            trip: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!activity) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    // Verify ownership
    if (activity.itineraryDay.trip.userId !== req.user!.userId) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    // Remove nested trip data from response
    const { itineraryDay, ...activityData } = activity;
    res.json({ activity: activityData });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new activity
router.post("/trip/:tripId/day/:dayId", async (req: Request, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const dayId = req.params.dayId as string;

    // Verify trip ownership
    if (!(await verifyTripOwnership(tripId, req.user!.userId))) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Verify day belongs to trip
    const day = await prisma.itineraryDay.findFirst({
      where: { id: dayId, tripId },
    });

    if (!day) {
      res.status(404).json({ error: "Day not found" });
      return;
    }

    const validation = createActivitySchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    // Get the max order for existing activities
    const maxOrderActivity = await prisma.activity.findFirst({
      where: { itineraryDayId: dayId },
      orderBy: { order: "desc" },
    });
    const newOrder = validation.data.order ?? (maxOrderActivity?.order ?? -1) + 1;

    const activity = await prisma.activity.create({
      data: {
        ...validation.data,
        order: newOrder,
        itineraryDayId: dayId,
      },
    });

    res.status(201).json({ activity });
  } catch (error) {
    console.error("Create activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an activity
router.put("/:id", async (req: Request, res: Response) => {
  try {
    // First get the activity with ownership info
    const existingActivity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        itineraryDay: {
          include: {
            trip: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!existingActivity) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    // Verify ownership
    if (existingActivity.itineraryDay.trip.userId !== req.user!.userId) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    const validation = updateActivitySchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: validation.data,
    });

    res.json({ activity });
  } catch (error) {
    console.error("Update activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete an activity
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // First get the activity with ownership info
    const existingActivity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        itineraryDay: {
          include: {
            trip: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!existingActivity) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    // Verify ownership
    if (existingActivity.itineraryDay.trip.userId !== req.user!.userId) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }

    await prisma.activity.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reorder activities within a day
router.put("/trip/:tripId/day/:dayId/reorder", async (req: Request, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const dayId = req.params.dayId as string;
    const { activityIds } = req.body;

    if (!Array.isArray(activityIds)) {
      res.status(400).json({ error: "activityIds must be an array" });
      return;
    }

    // Verify trip ownership
    if (!(await verifyTripOwnership(tripId, req.user!.userId))) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Update order for each activity
    await Promise.all(
      activityIds.map((id: string, index: number) =>
        prisma.activity.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    // Get updated activities
    const activities = await prisma.activity.findMany({
      where: { itineraryDayId: dayId },
      orderBy: { order: "asc" },
    });

    res.json({ activities });
  } catch (error) {
    console.error("Reorder activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bulk create activities
router.post("/trip/:tripId/day/:dayId/bulk", async (req: Request, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const dayId = req.params.dayId as string;
    const { activities: activitiesData } = req.body;

    if (!Array.isArray(activitiesData)) {
      res.status(400).json({ error: "activities must be an array" });
      return;
    }

    // Verify trip ownership
    if (!(await verifyTripOwnership(tripId, req.user!.userId))) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    // Verify day belongs to trip
    const day = await prisma.itineraryDay.findFirst({
      where: { id: dayId, tripId },
    });

    if (!day) {
      res.status(404).json({ error: "Day not found" });
      return;
    }

    // Validate all activities
    const validatedActivities = [];
    for (let i = 0; i < activitiesData.length; i++) {
      const validation = createActivitySchema.safeParse(activitiesData[i]);
      if (!validation.success) {
        res.status(400).json({
          error: `Validation failed for activity ${i}`,
          details: validation.error.issues,
        });
        return;
      }
      validatedActivities.push({
        ...validation.data,
        order: i,
        itineraryDayId: dayId,
      });
    }

    // Create all activities
    const created = await prisma.activity.createMany({
      data: validatedActivities,
    });

    // Get created activities
    const activities = await prisma.activity.findMany({
      where: { itineraryDayId: dayId },
      orderBy: { order: "asc" },
    });

    res.status(201).json({ 
      message: `${created.count} activities created`,
      activities 
    });
  } catch (error) {
    console.error("Bulk create activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
