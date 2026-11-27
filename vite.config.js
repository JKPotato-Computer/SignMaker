import { defineConfig } from "vite";
import Terminal from "vite-plugin-terminal";

export default defineConfig({
  plugins: [
    Terminal({
      console: "terminal",
      output: ["terminal", "console"], // Keeps it in both the browser and terminal
    }),
  ],
});
