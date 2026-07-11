import type { sendNotification } from "../shared/notifications/notification.dispatcher"
import type { UserAppLanguage } from "../shared/constants"

declare global {
  namespace Express {
    interface Locals {
      notifications?: {
        send: typeof sendNotification
      }
      /** Language resolved from the authenticated user's preference. Defaults to "en". */
      lang: UserAppLanguage
    }
  }
}

export {}
