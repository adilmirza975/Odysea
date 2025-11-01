import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";


// here we have prevent the list of dependencies from beign used aloowing us to use syncfusion components
export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr:{
    noExternal:[/@syncfusion/]
  }
});
