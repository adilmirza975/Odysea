# 🧭 Odysea — AI-Powered Travel Planning

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Runtime](https://img.shields.io/badge/runtime-Bun-000000?logo=bun)
![Frontend](https://img.shields.io/badge/frontend-React_Router_7-CA4245?logo=reactrouter)
![Backend](https://img.shields.io/badge/backend-Express.js_5-000000?logo=express)
![Database](https://img.shields.io/badge/database-PostgreSQL-4169E1?logo=postgresql)
![ORM](https://img.shields.io/badge/ORM-Prisma_7-2D3748?logo=prisma)
![AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google)
![Auth](https://img.shields.io/badge/auth-JWT-orange)
![Language](https://img.shields.io/badge/language-TypeScript-3178C6?logo=typescript)
![UI](https://img.shields.io/badge/UI-Tailwind_CSS_4-38B2AC?logo=tailwindcss)
![UI](https://img.shields.io/badge/UI-shadcn%2Fui-000000)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)
![Deploy](https://img.shields.io/badge/Deploy-Railway-0B0D0E?logo=railway)

Odysea is an intelligent travel planning platform that harnesses the power of Google's Gemini AI to create personalized, day-by-day travel itineraries. Whether you're a solo adventurer, a romantic couple, a group of friends, or a family seeking memorable vacations, Odysea generates comprehensive trip plans tailored to your destination, budget, travel style, and personal preferences. With beautiful destination imagery from Unsplash, detailed activity scheduling, cost estimates, and a travel wishlist feature, Odysea transforms the overwhelming task of trip planning into an effortless and enjoyable experience.

## Table of Contents

- [🧭 Odysea — AI-Powered Travel Planning](#-odysea--ai-powered-travel-planning)
  - [Table of Contents](#table-of-contents)
  - [📌 Live Services](#-live-services)
  - [📁 Repository Structure](#-repository-structure)
  - [🛠 Tech Stack](#-tech-stack)
    - [Languages \& Frameworks](#languages--frameworks)
    - [Libraries \& Tools](#libraries--tools)
  - [🧩 High-Level Architecture](#-high-level-architecture)
  - [🚀 Features](#-features)
    - [AI Trip Generation](#ai-trip-generation)
    - [Trip Management](#trip-management)
    - [Itinerary \& Activities](#itinerary--activities)
    - [Saved Destinations (Wishlist)](#saved-destinations-wishlist)
    - [Dashboard Experience](#dashboard-experience)
    - [Authentication](#authentication)
  - [📡 API Endpoints](#-api-endpoints)
    - [Health Check](#health-check)
    - [Authentication Routes](#authentication-routes)
    - [Trip Routes](#trip-routes)
    - [AI Routes](#ai-routes)
    - [Activity Routes](#activity-routes)
    - [Destination Routes](#destination-routes)
  - [⚙️ Installation (Local Development)](#️-installation-local-development)
    - [Prerequisites](#prerequisites)
    - [1) Clone and Install](#1-clone-and-install)
    - [2) Environment Variables](#2-environment-variables)
    - [3) Database Setup](#3-database-setup)
    - [4) Start Development](#4-start-development)
  - [🧪 Usage Guide](#-usage-guide)
    - [Web App](#web-app)
    - [API Scripts](#api-scripts)
    - [Web Scripts](#web-scripts)
  - [🗺️ Roadmap](#️-roadmap)
  - [👥 Authors](#-authors)

<a id="live-services"></a>

## 📌 Live Services

| Layer | Platform | Link                                          |
| ----- | -------- | ----------------------------------------------|
| Web   | Vercel   | https://odysea-web.vercel.app/                |
| API   | Railway  | https://odysea-production.up.railway.app/     |

<a id="repository-structure"></a>

## 📁 Repository Structure

```
odysea/
├─ api/                              # Backend: Express + Prisma + Gemini AI
│  ├─ src/
│  │  ├─ index.ts                    # Server entry point (Express app setup)
│  │  ├─ lib/
│  │  │  ├─ auth.ts                  # JWT & bcrypt password utilities
│  │  │  └─ prisma.ts                # PrismaClient singleton
│  │  ├─ middleware/
│  │  │  └─ auth.ts                  # JWT authentication middleware
│  │  ├─ routes/
│  │  │  ├─ auth.ts                  # Register, login, get current user
│  │  │  ├─ trips.ts                 # CRUD trips with filters, pagination, sorting
│  │  │  ├─ ai.ts                    # Gemini AI trip generation
│  │  │  ├─ activities.ts            # Activity management within itinerary days
│  │  │  └─ destinations.ts          # Saved destinations (wishlist) CRUD
│  │  └─ schemas/
│  │     └─ index.ts                 # Zod validation schemas
│  ├─ prisma/
│  │  ├─ schema.prisma               # Database models & enums
│  │  └─ migrations/                 # Database migrations
│  ├─ package.json
│  ├─ tsconfig.json
│  └─ prisma.config.ts
│
└─ web/                              # Frontend: React Router 7 + Tailwind + shadcn/ui
   ├─ app/
   │  ├─ root.tsx                    # App root with AuthProvider
   │  ├─ routes.ts                   # Route definitions
   │  ├─ app.css                     # Global styles
   │  ├─ components/
   │  │  ├─ ui/                      # shadcn/ui components (button, card, badge, etc.)
   │  │  ├─ layout/
   │  │  │  └─ dashboard-layout.tsx  # Dashboard layout wrapper
   │  │  └─ auth/                    # Auth guards (require-auth, redirect-if-authenticated)
   │  ├─ context/
   │  │  └─ auth-context.tsx         # Authentication context provider
   │  ├─ lib/
   │  │  ├─ api.ts                   # API client with typed methods
   │  │  └─ utils.ts                 # Utility functions (formatting, dates)
   │  └─ routes/
   │     ├─ home.tsx                 # Landing page
   │     ├─ login.tsx                # Login page
   │     ├─ register.tsx             # Registration page
   │     ├─ dashboard._index.tsx     # Dashboard overview
   │     ├─ dashboard.generate.tsx   # AI trip generator form
   │     ├─ dashboard.trips._index.tsx   # All trips with pagination & filters
   │     ├─ dashboard.trips.$id.tsx  # Trip detail view with itinerary
   │     └─ dashboard.destinations.tsx   # Saved destinations wishlist
   ├─ public/                        # Static assets
   ├─ package.json
   ├─ vite.config.ts
   ├─ react-router.config.ts
   ├─ tsconfig.json
   └─ Dockerfile
```

<a id="tech-stack"></a>

## 🛠 Tech Stack

### Languages & Frameworks

- **Frontend:** React 19, React Router 7, TypeScript
- **Backend:** Express.js 5, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 7
- **AI:** Google Generative AI (Gemini 2.0 Flash)

### Libraries & Tools

- **UI:** Tailwind CSS 4, shadcn/ui, Radix UI (Avatar, Dialog, Dropdown Menu, Label, Select, Separator, Slot, Tabs, Toast), Lucide Icons
- **Styling Utilities:** clsx, tailwind-merge, class-variance-authority
- **Authentication:** jsonwebtoken (JWT), bcryptjs
- **Validation:** Zod
- **HTTP:** cors
- **Images:** Unsplash API integration
- **Runtime:** Bun
- **Build Tools:** Vite 7, tsc, tsc-alias
- **Deployment:** Vercel (web), Railway (api)

<a id="high-level-architecture"></a>

## 🧩 High-Level Architecture

```
┌─────────────────────────┐          ┌─────────────────────────────┐          ┌─────────────────┐
│   React Router 7 App    │  fetch   │     Express.js 5 API        │  Prisma  │   PostgreSQL    │
│   (Vite + React 19)     ├─────────>│     /api/auth               ├─────────>│                 │
│                         │  Bearer  │     /api/trips              │          │   Users         │
│   - Dashboard           │  Token   │     /api/ai                 │          │   Trips         │
│   - Trip Generator      │          │     /api/activities         │          │   ItineraryDays │
│   - Destinations        │          │     /api/destinations       │          │   Activities    │
│                         │          │                             │          │   SavedDest.    │
└─────────────────────────┘          └──────────────┬──────────────┘          └─────────────────┘
                                                    │
                                                    │
                                     ┌──────────────▼──────────────┐
                                     │                             │
                                     │   Google Gemini AI          │
                                     │   (Trip Itinerary Gen)      │
                                     │                             │
                                     │   Unsplash API              │
                                     │   (Destination Images)      │
                                     │                             │
                                     └─────────────────────────────┘
```

**Key Architecture Details:**

- **Authentication:** JWT tokens stored in localStorage, sent via `Authorization: Bearer` header
- **CORS:** Configured to allow requests from `APP_ORIGIN` with credentials
- **AI Integration:** Google Gemini 2.0 Flash generates structured JSON itineraries with fallback mock generation
- **Image Sourcing:** Unsplash API fetches destination-specific travel images with fallback defaults
- **Database Relations:** User → Trips → ItineraryDays → Activities (cascading deletes)
- **API Design:** RESTful endpoints with Zod validation, pagination, filtering, and sorting support

<a id="features"></a>

## 🚀 Features

### AI Trip Generation

- Google Gemini 2.0 Flash powered itinerary generation
- Day-by-day activity planning with time slots
- Budget-aware recommendations (Mid-Range, Luxury, Premium)
- Travel group customization (Solo, Couple, Friends, Family)
- Custom preference input for personalized suggestions
- Automatic Unsplash image fetching for destinations

### Trip Management

- Create, read, update, delete trips
- Trip status tracking (Upcoming, Ongoing, Completed, Cancelled)
- Server-side search across title, description, destination, country
- Filter by status, budget, travel group, destination, country, date range
- Sort by start date, end date, created date, title, destination, total estimate
- Paginated trip listing with numbered page navigation

### Itinerary & Activities

- Day-by-day itinerary view with activities
- Activity categories: Transport, Accommodation, Food, Sightseeing, Activity, Shopping, Other
- Time scheduling (start/end times)
- Location tracking per activity
- Cost estimates per activity and total trip estimate
- Activity reordering within days
- Bulk activity creation
- CRUD operations on individual activities

### Saved Destinations (Wishlist)

- Save dream destinations to a personal wishlist
- Priority levels: Must Visit (High), Want to Visit (Medium), Someday (Low)
- Best season recommendations
- Estimated budget tracking
- Custom tags for organization
- Personal notes
- Auto-generated images from Unsplash
- Server-side search, filter, sort, and pagination

### Dashboard Experience

- Overview statistics (upcoming, ongoing, completed, total trips)
- Upcoming trips quick view with countdown
- Quick access to generate new trips
- Responsive design for mobile and desktop
- Clean, modern UI with shadcn/ui components

### Authentication

- Email and password registration with bcrypt hashing
- Secure login with JWT tokens
- Protected routes with auth middleware
- User profile management
- Session persistence via localStorage

<a id="api-endpoints"></a>

## 📡 API Endpoints

Base URL (local): `http://localhost:8000`  
Base URL (production): `https://odysea-production.up.railway.app`

All routes except auth require `Authorization: Bearer <token>` header.

### Health Check

| Endpoint  | Method | Description              | Access |
| --------- | ------ | ------------------------ | ------ |
| `/`       | GET    | API status check         | Public |
| `/health` | GET    | Health check + timestamp | Public |

### Authentication Routes

| Endpoint             | Method | Description                           | Access        |
| -------------------- | ------ | ------------------------------------- | ------------- |
| `/api/auth/register` | POST   | Register user (email, password, name) | Public        |
| `/api/auth/login`    | POST   | Login (email, password) → returns JWT | Public        |
| `/api/auth/me`       | GET    | Get current user profile              | Auth Required |

### Trip Routes

| Endpoint                    | Method | Description                                     | Access        |
| --------------------------- | ------ | ----------------------------------------------- | ------------- |
| `/api/trips`                | GET    | Get all trips (paginated, filterable, sortable) | Auth Required |
| `/api/trips/upcoming`       | GET    | Get upcoming trips (limit 5)                    | Auth Required |
| `/api/trips/stats/overview` | GET    | Get trip statistics                             | Auth Required |
| `/api/trips/:id`            | GET    | Get single trip with itinerary                  | Auth Required |
| `/api/trips`                | POST   | Create new trip                                 | Auth Required |
| `/api/trips/:id`            | PUT    | Update trip                                     | Auth Required |
| `/api/trips/:id`            | DELETE | Delete trip (cascades to days & activities)     | Auth Required |

### AI Routes

| Endpoint           | Method | Description                                     | Access        |
| ------------------ | ------ | ----------------------------------------------- | ------------- |
| `/api/ai/generate` | POST   | Generate AI trip itinerary (Gemini or fallback) | Auth Required |

### Activity Routes

| Endpoint                                          | Method | Description              | Access        |
| ------------------------------------------------- | ------ | ------------------------ | ------------- |
| `/api/activities/trip/:tripId/day/:dayId`         | GET    | Get activities for a day | Auth Required |
| `/api/activities/:id`                             | GET    | Get single activity      | Auth Required |
| `/api/activities/trip/:tripId/day/:dayId`         | POST   | Create activity          | Auth Required |
| `/api/activities/:id`                             | PUT    | Update activity          | Auth Required |
| `/api/activities/:id`                             | DELETE | Delete activity          | Auth Required |
| `/api/activities/trip/:tripId/day/:dayId/reorder` | PUT    | Reorder activities       | Auth Required |
| `/api/activities/trip/:tripId/day/:dayId/bulk`    | POST   | Bulk create activities   | Auth Required |

### Destination Routes

| Endpoint                           | Method | Description                                    | Access        |
| ---------------------------------- | ------ | ---------------------------------------------- | ------------- |
| `/api/destinations`                | GET    | Get saved destinations (paginated, filterable) | Auth Required |
| `/api/destinations/stats/overview` | GET    | Get destination statistics                     | Auth Required |
| `/api/destinations/:id`            | GET    | Get single destination                         | Auth Required |
| `/api/destinations`                | POST   | Create saved destination                       | Auth Required |
| `/api/destinations/:id`            | PUT    | Update destination                             | Auth Required |
| `/api/destinations/:id`            | DELETE | Delete destination                             | Auth Required |

<a id="installation-local-development"></a>

## ⚙️ Installation (Local Development)

<a id="prerequisites"></a>

### Prerequisites

- **Bun** >= 1.0 ([https://bun.sh](https://bun.sh))
- **PostgreSQL** (local or remote instance)
- **Google Gemini API Key** (optional, for AI generation)
- **Unsplash API Key** (optional, for destination images)

<a id="1-clone-and-install"></a>

### 1) Clone and Install

```bash
git clone https://github.com/AdilMirza975/Odysea.git
cd Odysea

# Install API dependencies
cd api
bun install

# Install Web dependencies
cd ../web
bun install
```

<a id="2-environment-variables"></a>

### 2) Environment Variables

**api/.env**

```env
# Server
PORT=8000

# Frontend origin (for CORS)
APP_ORIGIN=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/odysea

# JWT Configuration
JWT_SECRET="your-secure-random-secret-key"
JWT_EXPIRES_IN="7d"

# Google Gemini AI (optional - falls back to mock generation)
GEMINI_API_KEY="your-gemini-api-key"

# Unsplash API (optional - falls back to default images)
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
```

**web/.env**

```env
# Backend API URL
VITE_API_URL=http://localhost:8000/api
```

<a id="3-database-setup"></a>

### 3) Database Setup

```bash
cd api

# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate

# (Optional) Open Prisma Studio to view data
bun run db:studio
```

<a id="4-start-development"></a>

### 4) Start Development

**Start API server:**

```bash
cd api
bun run dev
# Server runs at http://localhost:8000
```

**Start Web app (in a new terminal):**

```bash
cd web
bun run dev
# App runs at http://localhost:5173
```

<a id="usage-guide"></a>

## 🧪 Usage Guide

<a id="web-app"></a>

### Web App

1. Open [http://localhost:5173](http://localhost:5173)
2. Register a new account or login with existing credentials
3. Navigate to **Dashboard** to see trip overview and statistics
4. Click **Generate New Trip** to create an AI-powered itinerary:
   - Enter destination city and country
   - Select travel dates
   - Choose your travel group type
   - Select budget range
   - Add optional preferences
   - Click "Generate Trip Itinerary"
5. View generated trips in **All Trips** with search, filter, and pagination
6. Click on a trip to view detailed day-by-day itinerary
7. Save dream destinations in **Saved Destinations** wishlist

<a id="api-scripts"></a>

### API Scripts

| Command               | Description                      |
| --------------------- | -------------------------------- |
| `bun run dev`         | Start dev server with hot reload |
| `bun run build`       | Build for production             |
| `bun run start`       | Start production server          |
| `bun run db:generate` | Generate Prisma client           |
| `bun run db:push`     | Push schema to database          |
| `bun run db:migrate`  | Run database migrations          |
| `bun run db:studio`   | Open Prisma Studio GUI           |

<a id="web-scripts"></a>

### Web Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `bun run dev`       | Start Vite dev server        |
| `bun run build`     | Build for production         |
| `bun run start`     | Serve production build       |
| `bun run typecheck` | Run TypeScript type checking |

<a id="roadmap"></a>

## 🗺️ Roadmap

- [ ] Google OAuth integration for social login
- [ ] Trip sharing and collaboration features
- [ ] Export itinerary to PDF/Calendar
- [ ] Real-time flight and hotel price integration
- [ ] Weather forecasts for trip dates
- [ ] Map integration with activity locations
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Trip templates for popular destinations
- [ ] Budget tracking and expense logging during trips
- [ ] Photo gallery for completed trips
- [ ] Social features (trip reviews, recommendations)

<a id="authors"></a>

## 👥 Authors

- **Adil Mirza** — [https://github.com/AdilMirza975](https://github.com/AdilMirza975)
