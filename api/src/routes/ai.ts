import { Router, type Request, type Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { generateTripSchema } from "../schemas/index.js";

const router = Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.use(authMiddleware);

// Fallback travel images from Unsplash (direct URLs that always work)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop&q=80",
];

// Fetch images from Unsplash for a destination
async function fetchUnsplashImages(destination: string, country: string): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  // If no API key, return fallback images
  if (!accessKey) {
    return FALLBACK_IMAGES;
  }

  try {
    const searchQuery = `${destination} ${country} travel landmark`;
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Unsplash API error:", response.status);
      return FALLBACK_IMAGES;
    }

    const data = await response.json() as { results?: Array<{ urls?: { regular?: string; small?: string } }> };
    const images = data.results?.map((photo) => photo.urls?.regular || photo.urls?.small || "").filter(Boolean) || [];
    
    // If we got fewer than 3 images, supplement with fallbacks
    while (images.length < 3) {
      images.push(FALLBACK_IMAGES[images.length % FALLBACK_IMAGES.length]!);
    }

    return images.slice(0, 3);
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return FALLBACK_IMAGES;
  }
}

// Generate AI trip itinerary
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const validation = generateTripSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
      });
      return;
    }

    const { destination, country, startDate, endDate, budget, travelGroup, preferences } = validation.data;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Fetch Unsplash images for the destination
    const images = await fetchUnsplashImages(destination, country);

    // Generate AI trip plan
    let generatedTrip: GeneratedTrip;
    
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-api-key") {
      // Use Gemini AI for real generation
      generatedTrip = await generateWithGemini({
        destination,
        country,
        days,
        budget,
        travelGroup,
        preferences,
        startDate: start,
      });
    } else {
      // Fallback to mock generation
      generatedTrip = await generateMockTrip({
        destination,
        country,
        days,
        budget,
        travelGroup,
        preferences,
        startDate: start,
      });
    }

    // Create the trip in database
    const trip = await prisma.trip.create({
      data: {
        title: `${days}-Day ${destination} Adventure`,
        description: generatedTrip.description,
        destination,
        country,
        startDate: start,
        endDate: end,
        budget,
        travelGroup,
        totalEstimate: generatedTrip.totalEstimate,
        coverImage: images[0] || null,
        images: images,
        userId: req.user!.userId,
        itineraryDays: {
          create: generatedTrip.itinerary.map((day, index) => ({
            dayNumber: index + 1,
            date: new Date(start.getTime() + index * 24 * 60 * 60 * 1000),
            title: day.title,
            description: day.description,
            activities: {
              create: day.activities.map((activity, actIndex) => ({
                ...activity,
                order: actIndex,
              })),
            },
          })),
        },
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

    res.status(201).json({ trip });
  } catch (error) {
    console.error("Generate trip error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mock AI trip generation function
// Replace this with actual OpenAI integration
interface GeneratedActivity {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  estimatedCost: number;
  category: "TRANSPORT" | "ACCOMMODATION" | "FOOD" | "SIGHTSEEING" | "ACTIVITY" | "SHOPPING" | "OTHER";
}

interface GeneratedDay {
  title: string;
  description: string;
  activities: GeneratedActivity[];
}

interface GeneratedTrip {
  description: string;
  totalEstimate: number;
  itinerary: GeneratedDay[];
}

// Gemini AI trip generation
async function generateWithGemini(params: {
  destination: string;
  country: string;
  days: number;
  budget: string;
  travelGroup: string;
  preferences?: string;
  startDate: Date;
}): Promise<GeneratedTrip> {
  const { destination, country, days, budget, travelGroup, preferences } = params;

  const budgetDescriptions: Record<string, string> = {
    MID_RANGE: "mid-range budget ($100-200 per day)",
    LUXURY: "luxury budget ($200-400 per day)",
    PREMIUM: "premium/ultra-luxury budget ($400+ per day)",
  };

  const travelGroupDescriptions: Record<string, string> = {
    SOLO: "solo traveler",
    COUPLE: "romantic couple",
    FRIENDS: "group of friends",
    FAMILY: "family with children",
  };

  const prompt = `Generate a detailed ${days}-day travel itinerary for ${destination}, ${country}.

Travel details:
- Budget level: ${budgetDescriptions[budget] || budget}
- Travel group: ${travelGroupDescriptions[travelGroup] || travelGroup}
- Special preferences: ${preferences || "None specified"}

Please provide a JSON response with this exact structure:
{
  "description": "A brief 1-2 sentence description of the trip",
  "totalEstimate": <total estimated cost as a number in USD>,
  "itinerary": [
    {
      "title": "Day 1: <descriptive title>",
      "description": "Brief description of the day",
      "activities": [
        {
          "title": "Activity name",
          "description": "Detailed description of the activity",
          "startTime": "HH:MM (24-hour format)",
          "endTime": "HH:MM (24-hour format)",
          "location": "Specific location name",
          "estimatedCost": <cost as number in USD>,
          "category": "TRANSPORT" | "ACCOMMODATION" | "FOOD" | "SIGHTSEEING" | "ACTIVITY" | "SHOPPING" | "OTHER"
        }
      ]
    }
  ]
}

Important requirements:
1. Include 4-5 activities per day
2. Activities should be realistic and specific to ${destination}
3. Include actual restaurant names, attractions, and locations when possible
4. Times should flow logically through the day
5. Costs should be realistic for the ${budget} budget level
6. Tailor activities to ${travelGroupDescriptions[travelGroup] || travelGroup}
7. First day should include arrival, last day should include departure
8. Return ONLY valid JSON, no markdown or additional text`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);
    
    // Validate and sanitize the response
    return {
      description: parsed.description || `A ${days}-day trip to ${destination}, ${country}`,
      totalEstimate: typeof parsed.totalEstimate === "number" ? parsed.totalEstimate : days * 200,
      itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary.map((day: any, index: number) => ({
        title: day.title || `Day ${index + 1}`,
        description: day.description || "",
        activities: Array.isArray(day.activities) ? day.activities.map((act: any) => ({
          title: act.title || "Activity",
          description: act.description || "",
          startTime: act.startTime || "09:00",
          endTime: act.endTime || "10:00",
          location: act.location || destination,
          estimatedCost: typeof act.estimatedCost === "number" ? act.estimatedCost : 50,
          category: ["TRANSPORT", "ACCOMMODATION", "FOOD", "SIGHTSEEING", "ACTIVITY", "SHOPPING", "OTHER"].includes(act.category) 
            ? act.category 
            : "ACTIVITY",
        })) : [],
      })) : [],
    };
  } catch (error) {
    console.error("Gemini AI generation failed, falling back to mock:", error);
    // Fallback to mock generation if Gemini fails
    return generateMockTrip(params);
  }
}

// Mock AI trip generation function (fallback)
async function generateMockTrip(params: {
  destination: string;
  country: string;
  days: number;
  budget: string;
  travelGroup: string;
  preferences?: string;
  startDate: Date;
}): Promise<GeneratedTrip> {
  const { destination, country, days, budget, travelGroup, startDate } = params;

  // Budget multipliers
  const budgetMultiplier = {
    MID_RANGE: 1,
    LUXURY: 2.5,
    PREMIUM: 4,
  }[budget] || 1;

  // Base costs per day
  const baseDailyCost = 150 * budgetMultiplier;

  // Sample activities based on travel group
  const groupActivities: Record<string, string[]> = {
    SOLO: ["Museum visit", "Local café exploration", "Walking tour", "Street food tasting"],
    COUPLE: ["Romantic dinner", "Sunset viewing", "Spa day", "Wine tasting"],
    FRIENDS: ["Bar hopping", "Adventure sports", "Beach party", "Local nightlife"],
    FAMILY: ["Theme park", "Zoo visit", "Family restaurant", "Educational tour"],
  };

  const activities = groupActivities[travelGroup] || groupActivities.SOLO;

  // Generate itinerary for each day
  const itinerary: GeneratedDay[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayActivities: GeneratedActivity[] = [];

    // Morning activity
    dayActivities.push({
      title: i === 0 ? `Arrival at ${destination}` : `Morning exploration`,
      description: i === 0 
        ? `Arrive at ${destination}, ${country}. Check into your ${budget === "PREMIUM" ? "luxury" : budget === "LUXURY" ? "upscale" : "comfortable"} accommodation.`
        : `Start your day with a refreshing breakfast and explore ${destination}.`,
      startTime: i === 0 ? "14:00" : "08:00",
      endTime: i === 0 ? "16:00" : "10:00",
      location: i === 0 ? `${destination} Airport` : `${destination} City Center`,
      estimatedCost: i === 0 ? 50 * budgetMultiplier : 20 * budgetMultiplier,
      category: i === 0 ? "TRANSPORT" : "FOOD",
    });

    // Mid-day activity
    const groupActivitiesList = activities || [];
    const midDayActivity = groupActivitiesList[i % groupActivitiesList.length] || "Local exploration";
    dayActivities.push({
      title: midDayActivity,
      description: `Enjoy ${midDayActivity.toLowerCase()} in the heart of ${destination}.`,
      startTime: "11:00",
      endTime: "14:00",
      location: `${destination} ${["Downtown", "Old Town", "Cultural District", "Waterfront"][i % 4]}`,
      estimatedCost: 60 * budgetMultiplier,
      category: "SIGHTSEEING",
    });

    // Lunch
    dayActivities.push({
      title: `Lunch at ${budget === "PREMIUM" ? "Michelin-starred" : budget === "LUXURY" ? "renowned" : "popular local"} restaurant`,
      description: `Savor ${country} cuisine at a ${budget.toLowerCase().replace("_", " ")} restaurant.`,
      startTime: "14:00",
      endTime: "15:30",
      location: `${destination} Restaurant District`,
      estimatedCost: 40 * budgetMultiplier,
      category: "FOOD",
    });

    // Afternoon activity
    const afternoonActivity = groupActivitiesList[(i + 1) % groupActivitiesList.length] || "Cultural experience";
    dayActivities.push({
      title: i === days - 1 ? "Shopping for souvenirs" : afternoonActivity,
      description: i === days - 1 
        ? `Pick up memorable souvenirs from ${destination}.`
        : `Continue exploring with ${afternoonActivity.toLowerCase()}.`,
      startTime: "16:00",
      endTime: "18:30",
      location: `${destination} ${i === days - 1 ? "Shopping Street" : "Tourist Area"}`,
      estimatedCost: i === days - 1 ? 100 * budgetMultiplier : 50 * budgetMultiplier,
      category: i === days - 1 ? "SHOPPING" : "ACTIVITY",
    });

    // Evening
    if (i < days - 1) {
      dayActivities.push({
        title: `Dinner and ${travelGroup === "COUPLE" ? "romantic evening" : "entertainment"}`,
        description: `End the day with a wonderful dinner and ${destination}'s evening attractions.`,
        startTime: "19:00",
        endTime: "22:00",
        location: `${destination} ${travelGroup === "COUPLE" ? "Romantic Quarter" : "Entertainment District"}`,
        estimatedCost: 80 * budgetMultiplier,
        category: "FOOD",
      });
    } else {
      dayActivities.push({
        title: `Departure from ${destination}`,
        description: `Say goodbye to ${destination} and head to the airport for your departure.`,
        startTime: "19:00",
        endTime: "21:00",
        location: `${destination} Airport`,
        estimatedCost: 50 * budgetMultiplier,
        category: "TRANSPORT",
      });
    }

    itinerary.push({
      title: `Day ${i + 1}: ${i === 0 ? `Arrival & First Impressions` : i === days - 1 ? `Farewell ${destination}` : `Exploring ${destination}`}`,
      description: `${i === 0 ? "Begin your adventure" : i === days - 1 ? "Final day of exploration" : "Continue your journey"} in beautiful ${destination}, ${country}.`,
      activities: dayActivities,
    });
  }

  const totalEstimate = days * baseDailyCost + 200 * budgetMultiplier; // Add flight estimate

  return {
    description: `A ${days}-day ${budget.toLowerCase().replace("_", " ")} trip to ${destination}, ${country}, perfect for ${travelGroup.toLowerCase() === "solo" ? "solo travelers" : travelGroup.toLowerCase()}.`,
    totalEstimate,
    itinerary,
  };
}

export default router;
