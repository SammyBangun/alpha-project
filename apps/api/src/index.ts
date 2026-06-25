// Project Alpha API entrypoint.
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./lib/env.js";
import { openapiSpec } from "./lib/openapi.js";
import { apiRouter } from "./routes/index.js";
import { authRouter } from "./routes/auth.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: "256kb" }));

// liveness
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// API docs: raw OpenAPI JSON + Swagger UI. helmet's CSP would block the UI's
// inline assets, so scope its loosened CSP to the /docs subtree only.
app.get("/openapi.json", (_req, res) => res.json(openapiSpec));
app.use(
  "/docs",
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, { customSiteTitle: "Project Alpha API" }),
);

// Tight rate limit on auth endpoints (brute-force protection).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use("/auth", authLimiter, authRouter);

// Protected API routes (/days, /metrics).
app.use(apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`⚡ Project Alpha API listening on http://localhost:${env.PORT}`);
});
