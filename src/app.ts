import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import pinoHttp from "pino-http"
import routes from "./routes"
import { errorHandler } from "./shared/middleware/error.middleware"
import { apiRateLimiter } from "./shared/middleware/rateLimit.middleware"
import { setupSwagger } from "./config/swagger"
import logger from "./config/logger"
import { NotFoundError } from "./shared/errors/NotFoundError"

const app = express()

app.use(pinoHttp({ logger }))
const helmetDefault = helmet()
const helmetSwagger = helmet({ contentSecurityPolicy: false })
app.use((req, res, next) => {
  if (req.path === "/api-docs" || req.path.startsWith("/api-docs/")) {
    helmetSwagger(req, res, next)
  } else {
    helmetDefault(req, res, next)
  }
})
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3002",
      "http://127.0.0.1:3002",
    ],
    credentials: true,
  })
)
app.use(compression())
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))

app.use("/api", apiRateLimiter, routes)

setupSwagger(app, "/api-docs")

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use((_req, _res, next) => next(new NotFoundError("Route not found")))

app.use(errorHandler)

export default app
