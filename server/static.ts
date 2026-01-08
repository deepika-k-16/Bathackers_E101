import type { Express } from "express";
import express from "express";
import path from "path";

export function serveStatic(app: Express) {
  // Project root (where package.json is)
  const rootDir = process.cwd();

  // dist/public created by Vite build
  const publicDir = path.join(rootDir, "dist", "public");

  // Serve static assets (JS, CSS, images)
  app.use(express.static(publicDir));

  // React SPA catch-all (THIS IS THE KEY)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}
