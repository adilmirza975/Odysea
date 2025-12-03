import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard._index.tsx"),
  route("dashboard/trips", "routes/dashboard.trips._index.tsx"),
  route("dashboard/trips/:id", "routes/dashboard.trips.$id.tsx"),
  route("dashboard/generate", "routes/dashboard.generate.tsx"),
  route("dashboard/destinations", "routes/dashboard.destinations.tsx"),
] satisfies RouteConfig;
