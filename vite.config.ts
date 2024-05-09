import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [tsconfigPaths(), solid()],
});
