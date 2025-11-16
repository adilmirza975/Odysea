// think it of as configuration file

import { type RouteConfig, route, layout} from "@react-router/dev/routes";

export default [
  route('sign_in','routes/root/sign_in.tsx'),
  layout('routes/admin/admin_layout.tsx',[

    route("dashboard", "routes/admin/dashboard.tsx"),
    route("all_users", "routes/admin/all_users.tsx"),
  ]),
] satisfies RouteConfig;
