import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 1000 * 60,
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
