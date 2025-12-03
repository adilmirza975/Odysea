import { Router, type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { createTripSchema, updateTripSchema } from "../schemas/index.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all trips for the current user with search, sort, filter, pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const { 
      status, 
      page = "1", 
      limit = "10",
      search,
      sortBy = "startDate",
      sortOrder = "asc",
      budget,
      travelGroup,
      destination,
      country,
      startDateFrom,
      startDateTo
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause with filters
    const where: any = { userId: req.user!.userId };
    
    // Status filter
    if (status && status !== "all") {
      where.status = status;
    }
    
    // Budget filter
    if (budget) {
      where.budget = budget;
    }
    
    // Travel group filter
    if (travelGroup) {
      where.travelGroup = travelGroup;
    }
    
    // Destination filter (case-insensitive)
    if (destination) {
      where.destination = {
        contains: destination as string,
        mode: "insensitive",
      };
    }
    
    // Country filter (case-insensitive)
    if (country) {
      where.country = {
        contains: country as string,
        mode: "insensitive",
      };
    }
    
    // Date range filter
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom as string);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo as string);
      }
    }
    
    // Search across multiple fields
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { destination: { contains: search as string, mode: "insensitive" } },
        { country: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Build orderBy clause
    const validSortFields = ["startDate", "endDate", "createdAt", "updatedAt", "title", "destination", "totalEstimate"];
    const orderByField = validSortFields.includes(sortBy as string) ? sortBy : "startDate";
    const orderByDirection = sortOrder === "desc" ? "desc" : "asc";
    
    const orderBy: any = { [orderByField as string]: orderByDirection };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          itineraryDays: {
            include: {
              activities: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { dayNumber: "asc" },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({
      trips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        status: status || null,
        budget: budget || null,
        travelGroup: travelGroup || null,
        destination: destination || null,
        country: country || null,
        search: search || null,
        sortBy: orderByField,
        sortOrder: orderByDirection,
      },
    });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get upcoming trips
router.get("/upcoming", async (req: Request, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        userId: req.user!.userId,
        status: "UPCOMING",
        startDate: { gte: new Date() },
      },
      include: {
        itineraryDays: {
          include: {
            activities: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { dayNumber: "asc" },
        },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    });

    res.json({ trips });
  } catch (error) {
    console.error("Get upcoming trips error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single trip
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        itineraryDays: {
          include: {
            activities: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { dayNumber: "asc" },
        },
      },
    });

    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    res.json({ trip });
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new trip
router.post("/", async (req: Request, res: Response) => {
  try {
    const validation = createTripSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    const trip = await prisma.trip.create({
      data: {
        ...validation.data,
        userId: req.user!.userId,
      },
      include: {
        itineraryDays: {
          include: {
            activities: true,
          },
        },
      },
    });

    res.status(201).json({ trip });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a trip
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const validation = updateTripSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    // Check if trip exists and belongs to user
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!existingTrip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: validation.data,
      include: {
        itineraryDays: {
          include: {
            activities: true,
          },
        },
      },
    });

    res.json({ trip });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a trip
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Check if trip exists and belongs to user
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!existingTrip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    await prisma.trip.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get trip statistics
router.get("/stats/overview", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [upcoming, ongoing, completed, total] = await Promise.all([
      prisma.trip.count({ where: { userId, status: "UPCOMING" } }),
      prisma.trip.count({ where: { userId, status: "ONGOING" } }),
      prisma.trip.count({ where: { userId, status: "COMPLETED" } }),
      prisma.trip.count({ where: { userId } }),
    ]);

    res.json({
      stats: {
        upcoming,
        ongoing,
        completed,
        total,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
