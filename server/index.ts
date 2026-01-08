import dotenv from "dotenv";
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

/* -------------------- MIDDLEWARE -------------------- */

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/* -------------------- REQUEST LOGGER -------------------- */

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  res.json = (body: any) => {
    capturedJsonResponse = body;
    return originalResJson(body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

/* -------------------- PUBLIC ROUTES (FIX FOR 403) -------------------- */

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "GrowGuide backend" });
});


app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "GrowGuide API",
    endpoints: [
      "/api/vendors",
      "/api/vendors/:id",
      "/api/vendors/:id/dashboard",
      "/api/vendors/:id/matches",
      "/api/collaboration-requests",
      "/api/expansion-requests",
      "/api/ai/generate-content"
    ]
  });
});

/* -------------------- MAIN BOOTSTRAP -------------------- */

(async () => {
  // Register all API routes
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Vite (dev) or static (prod)
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);

  httpServer.listen(port, "127.0.0.1", () => {
    log(`serving on http://localhost:${port}`);
  });
})();
