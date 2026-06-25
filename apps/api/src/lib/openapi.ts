// OpenAPI 3.1 spec for the Project Alpha API.
// Hand-written to mirror the actual routes/controllers/zod schemas.
// Served as raw JSON at /openapi.json and rendered by Swagger UI at /docs.
import { env } from "./env.js";

export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Project Alpha API",
    version: "0.1.0",
    description:
      "REST API for Project Alpha — server-authoritative daily scoring. " +
      "All metrics are derived from DailyLog via @alpha/core; the server always " +
      "re-computes `score` on write (client score is never trusted).",
  },
  servers: [{ url: `http://localhost:${env.PORT}`, description: "Local dev" }],
  tags: [
    { name: "Health" },
    { name: "Auth", description: "Public, rate-limited (30 req / 15 min)." },
    { name: "Days", description: "Daily logs — requires bearer auth, user-scoped." },
    { name: "Metrics", description: "Derived metrics — requires bearer auth." },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Invalid email or password" },
          code: { type: "string", nullable: true, example: "EMAIL_TAKEN" },
        },
        required: ["error"],
      },
      PublicUser: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx0abc123" },
          email: { type: "string", format: "email" },
          displayName: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "email", "displayName", "createdAt"],
      },
      AuthResult: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/PublicUser" },
          accessToken: { type: "string", description: "JWT access token (~15m)." },
          refreshToken: { type: "string", description: "Rotating, single-use refresh token." },
        },
        required: ["user", "accessToken", "refreshToken"],
      },
      AuthTokens: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          refreshToken: { type: "string", description: "New token; old one is invalidated." },
        },
        required: ["accessToken", "refreshToken"],
      },
      RegisterInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          displayName: { type: "string", minLength: 1, maxLength: 80 },
        },
        required: ["email", "password"],
      },
      LoginInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 1 },
        },
        required: ["email", "password"],
      },
      RefreshInput: {
        type: "object",
        properties: { refreshToken: { type: "string", minLength: 10 } },
        required: ["refreshToken"],
      },
      DailyLog: {
        type: "object",
        description: "Canonical daily log. `score` is server-computed (0..100).",
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          date: { type: "string", format: "date-time" },
          noZeroDay: { type: "boolean" },
          deepWorkHours: { type: "number", minimum: 0, maximum: 24 },
          workout: { type: "boolean" },
          learningMinutes: { type: "integer", minimum: 0, maximum: 1440 },
          mit: { type: "string", nullable: true },
          intentions: { type: "string", nullable: true },
          reflection: { type: "string", nullable: true },
          lessons: { type: "string", nullable: true },
          oathCount: { type: "integer", minimum: 0, maximum: 7 },
          score: { type: "integer", minimum: 0, maximum: 100, readOnly: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      DayUpsertInput: {
        type: "object",
        description: "Partial patch. `score` is NEVER accepted — the server computes it.",
        properties: {
          deepWorkHours: { type: "number", minimum: 0, maximum: 24 },
          workout: { type: "boolean" },
          learningMinutes: { type: "integer", minimum: 0, maximum: 1440 },
          noZeroDay: { type: "boolean" },
          oathCount: { type: "integer", minimum: 0, maximum: 7 },
          mit: { type: "string", maxLength: 2000 },
          intentions: { type: "string", maxLength: 5000 },
          reflection: { type: "string", maxLength: 5000 },
          lessons: { type: "string", maxLength: 5000 },
        },
      },
      MetricsSummary: {
        type: "object",
        properties: {
          daily: { type: "integer", description: "Today's dayScore (0..100)." },
          weekly: { type: "integer", description: "Avg dayScore, trailing 7 days." },
          monthly: { type: "integer", description: "Avg dayScore, trailing 30 days." },
          streak: { type: "integer", description: "Consecutive days with dayScore >= 50." },
          level: {
            type: "object",
            properties: {
              num: { type: "integer", minimum: 1, maximum: 5 },
              name: { type: "string", example: "Operator" },
              consistency: { type: "integer" },
              next: { type: "string", nullable: true },
            },
            required: ["num", "name", "consistency", "next"],
          },
          xp: { type: "integer", description: "Lifetime sum of daily scores in window." },
        },
        required: ["daily", "weekly", "monthly", "streak", "level", "xp"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } },
            },
          },
          "409": {
            description: "Email already registered",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResult" } },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token",
        description: "Single-use: the presented refresh token is invalidated; a fresh pair is returned.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshInput" } },
          },
        },
        responses: {
          "200": {
            description: "New token pair",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthTokens" } },
            },
          },
          "401": {
            description: "Refresh token revoked or expired",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke a refresh token (logout one device)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshInput" } },
          },
        },
        responses: { "204": { description: "Revoked (idempotent)" } },
      },
    },
    "/days": {
      get: {
        tags: ["Days"],
        summary: "List daily logs in a date range",
        parameters: [
          {
            name: "from",
            in: "query",
            schema: { type: "string", format: "date", example: "2026-06-01" },
          },
          {
            name: "to",
            in: "query",
            schema: { type: "string", format: "date", example: "2026-06-24" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/DailyLog" } },
              },
            },
          },
          "401": { description: "Missing/invalid bearer token" },
        },
      },
    },
    "/days/{date}": {
      parameters: [
        {
          name: "date",
          in: "path",
          required: true,
          schema: { type: "string", format: "date", example: "2026-06-24" },
          description: "YYYY-MM-DD calendar date.",
        },
      ],
      get: {
        tags: ["Days"],
        summary: "Get one day's log",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/DailyLog" } },
            },
          },
          "401": { description: "Missing/invalid bearer token" },
          "404": {
            description: "No log for that date",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
      put: {
        tags: ["Days"],
        summary: "Upsert a day's log (server re-scores)",
        description:
          "Idempotent upsert by (userId, date). The server re-computes `score` with " +
          "@alpha/core dayScore() and ignores any client-sent score.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/DayUpsertInput" } },
          },
        },
        responses: {
          "200": {
            description: "Upserted, canonical record",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/DailyLog" } },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": { description: "Missing/invalid bearer token" },
        },
      },
    },
    "/metrics/summary": {
      get: {
        tags: ["Metrics"],
        summary: "Derived dashboard summary",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/MetricsSummary" } },
            },
          },
          "401": { description: "Missing/invalid bearer token" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
} as const;
