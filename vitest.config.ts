import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    watch: false,
    testTimeout: 1000 * 60,
    environment: "node",
    globals: true,
    exclude: ["node_modules", "**/node_modules/**"], // Exclude node_modules from tests
    // exclude: ["**/node_modules/**", "node_modules/**"],
    // typecheck: {
    //   ignoreSourceErrors: true,
    //   include: ["src/**/*.test.ts"],
    // },
  },
  // resolve: {
  //   preserveSymlinks: true,
  // },
  plugins: [tsconfigPaths()],
});
