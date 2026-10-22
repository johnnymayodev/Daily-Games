import { defineConfig } from "vitest/config";

// The client scripts are plain browser modules, so the suite runs on Node with
// hand-rolled globals instead of a full DOM implementation.
export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts"],
  },
});
