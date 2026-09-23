import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const harnessRoot = path.resolve(import.meta.dirname, "harness");

export default defineConfig({
  root: appRoot,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@/hooks/useTokenGate",
        replacement: path.resolve(harnessRoot, "mocks/useTokenGate.ts"),
      },
      {
        find: "@/hooks/useExamSave",
        replacement: path.resolve(harnessRoot, "mocks/useExamSave.ts"),
      },
      {
        find: "@/components/PatientSelector",
        replacement: path.resolve(harnessRoot, "mocks/PatientSelector.tsx"),
      },
      { find: "@", replacement: path.resolve(appRoot, "src") },
    ],
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true,
  },
});