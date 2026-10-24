import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({ test:{include:["**/*.test.{ts,tsx}"],exclude:["e2e/**","node_modules/**"],environment:"jsdom",setupFiles:["./vitest.setup.ts"],coverage:{reporter:["text","html"]}},resolve:{alias:{"@":path.resolve(import.meta.dirname,".")}} });
