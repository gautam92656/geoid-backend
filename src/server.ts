import app from "./app"
import { env } from "./config/env"
import logger from "./config/logger"

const PORT = env.PORT

async function startServer() {
  try {
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
      logger.info(`Environment: ${env.NODE_ENV}`)
      logger.info(`Swagger API docs: http://localhost:${PORT}/api-docs/`)
    })
  } catch (error) {
    logger.error({ err: error }, "Failed to start server")
    process.exit(1)
  }
}

startServer()
