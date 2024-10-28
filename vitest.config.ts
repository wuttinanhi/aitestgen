import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 1000 * 60,
    exclude: ["**/node_modules/**"],
  },
  // resolve: {
  //   preserveSymlinks: true,
  // },
  plugins: [tsconfigPaths()],
});
