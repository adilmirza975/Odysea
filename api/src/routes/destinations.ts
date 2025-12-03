import { Router, type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schemas
const createDestinationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  bestSeason: z.string().optional(),
  estimatedBudget: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

const updateDestinationSchema = createDestinationSchema.partial();

// GET all saved destinations with filtering, sorting, searching, pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      priority,
      country,
      tag,
      minBudget,
      maxBudget,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { userId: req.user!.userId };

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    // Country filter
    if (country) {
      where.country = {
        contains: country as string,
        mode: "insensitive",
      };
    }

    // Tag filter
    if (tag) {
      where.tags = {
        has: tag as string,
      };
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      where.estimatedBudget = {};
      if (minBudget) {
        where.estimatedBudget.gte = parseFloat(minBudget as string);
      }
      if (maxBudget) {
        where.estimatedBudget.lte = parseFloat(maxBudget as string);
      }
    }

    // Search across multiple fields
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { country: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { notes: { contains: search as string, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    const validSortFields = ["createdAt", "updatedAt", "name", "country", "priority", "estimatedBudget"];
    const orderByField = validSortFields.includes(sortBy as string) ? sortBy : "createdAt";
    const orderByDirection = sortOrder === "asc" ? "asc" : "desc";

    const [destinations, total] = await Promise.all([
      prisma.savedDestination.findMany({
        where,
        orderBy: { [orderByField as string]: orderByDirection },
        skip,
        take: limitNum,
      }),
      prisma.savedDestination.count({ where }),
    ]);

    res.json({
      destinations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        search: search || null,
        priority: priority || null,
        country: country || null,
        sortBy: orderByField,
        sortOrder: orderByDirection,
      },
    });
  } catch (error) {
    console.error("Get destinations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET single destination
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const destination = await prisma.savedDestination.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!destination) {
      res.status(404).json({ error: "Destination not found" });
      return;
    }

    res.json({ destination });
  } catch (error) {
    console.error("Get destination error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE destination
router.post("/", async (req: Request, res: Response) => {
  try {
    const validation = createDestinationSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    const data = validation.data;

    // Fetch image from Unsplash if not provided
    let imageUrl = data.imageUrl;
    if (!imageUrl) {
      // Use Unsplash API if key is available, otherwise use a placeholder
      const accessKey = process.env.UNSPLASH_ACCESS_KEY;
      if (accessKey) {
        try {
          const searchQuery = `${data.name} ${data.country} travel landmark`;
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
            {
              headers: {
                Authorization: `Client-ID ${accessKey}`,
              },
            }
          );
          if (response.ok) {
            const result = await response.json() as { results?: Array<{ urls?: { regular?: string } }> };
            imageUrl = result.results?.[0]?.urls?.regular || undefined;
          }
        } catch (error) {
          console.error("Failed to fetch Unsplash image:", error);
        }
      }
      
      // Fallback to placeholder if no image found
      if (!imageUrl) {
        imageUrl = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80`;
      }
    }

    const destination = await prisma.savedDestination.create({
      data: {
        ...data,
        imageUrl,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({ destination });
  } catch (error) {
    console.error("Create destination error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE destination
router.put("/:id", async (req: Request, res: Response) => {
  try {
    // Check ownership
    const existing = await prisma.savedDestination.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Destination not found" });
      return;
    }

    const validation = updateDestinationSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    const destination = await prisma.savedDestination.update({
      where: { id: req.params.id },
      data: validation.data,
    });

    res.json({ destination });
  } catch (error) {
    console.error("Update destination error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE destination
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Check ownership
    const existing = await prisma.savedDestination.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Destination not found" });
      return;
    }

    await prisma.savedDestination.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Delete destination error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET destination stats
router.get("/stats/overview", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [total, highPriority, countries] = await Promise.all([
      prisma.savedDestination.count({ where: { userId } }),
      prisma.savedDestination.count({ where: { userId, priority: "HIGH" } }),
      prisma.savedDestination.groupBy({
        by: ["country"],
        where: { userId },
        _count: true,
      }),
    ]);

    res.json({
      stats: {
        total,
        highPriority,
        uniqueCountries: countries.length,
      },
    });
  } catch (error) {
    console.error("Get destination stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
