import mailchimp from "@mailchimp/mailchimp_marketing"
import mailchimpTx from "@mailchimp/mailchimp_transactional"
import crypto from "crypto"
import { env } from "../../config/env"
import logger from "../../config/logger"

/* ── Transactional (Mandrill) ────────────────────────────────────────────── */

let txClient: ReturnType<typeof mailchimpTx> | null = null

function getTxClient() {
  if (!txClient) {
    if (!env.MAILCHIMP_TRANSACTIONAL_API_KEY) return null
    txClient = mailchimpTx(env.MAILCHIMP_TRANSACTIONAL_API_KEY)
  }
  return txClient
}

export interface SendMailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  fromEmail?: string
  fromName?: string
  replyTo?: string
}

/**
 * Sends a transactional email via Mailchimp Transactional (Mandrill).
 * Falls back to a warning log when the API key is not configured so it
 * never breaks non-email flows.
 */
export async function sendMailViaMailchimp(opts: SendMailOptions): Promise<void> {
  const client = getTxClient()
  if (!client) {
    logger.warn("MAILCHIMP_TRANSACTIONAL_API_KEY not set; skipping transactional email")
    return
  }

  try {
    await client.messages.send({
      message: {
        from_email: opts.fromEmail ?? env.MAILCHIMP_FROM_EMAIL,
        from_name: opts.fromName ?? env.MAILCHIMP_FROM_NAME,
        to: [{ email: opts.to, type: "to" }],
        subject: opts.subject,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { headers: { "Reply-To": opts.replyTo } } : {}),
      },
    })
  } catch (err: any) {
    logger.error({ err: err?.response?.body ?? err?.message }, "mailchimp transactional: failed to send email")
    throw err
  }
}

/* ── Marketing (audience management) ────────────────────────────────────── */

let initialised = false

function init() {
  if (initialised) return
  if (!env.MAILCHIMP_API_KEY || !env.MAILCHIMP_SERVER_PREFIX) return
  mailchimp.setConfig({ apiKey: env.MAILCHIMP_API_KEY, server: env.MAILCHIMP_SERVER_PREFIX })
  initialised = true
}

function emailHash(email: string): string {
  return crypto.createHash("md5").update(email.toLowerCase()).digest("hex")
}

export interface SubscriberData {
  email: string
  firstName?: string
  lastName?: string
  tags?: string[]
}

/**
 * Adds or updates a subscriber in the configured Mailchimp audience.
 * Uses PUT (upsert) so re-subscribing an archived/unsubscribed contact
 * does not throw — it re-activates them.
 * Silently no-ops when Mailchimp env vars are not configured.
 */
export async function addOrUpdateSubscriber(data: SubscriberData): Promise<void> {
  init()
  if (!initialised || !env.MAILCHIMP_LIST_ID) return

  const hash = emailHash(data.email)

  try {
    await (mailchimp.lists as any).setListMember(env.MAILCHIMP_LIST_ID, hash, {
      email_address: data.email,
      status_if_new: "subscribed",
      merge_fields: {
        ...(data.firstName ? { FNAME: data.firstName } : {}),
        ...(data.lastName ? { LNAME: data.lastName } : {}),
      },
    })

    if (data.tags?.length) {
      await (mailchimp.lists as any).updateListMemberTags(env.MAILCHIMP_LIST_ID, hash, {
        tags: data.tags.map((name) => ({ name, status: "active" })),
      })
    }
  } catch (err: any) {
    // Log but never throw — email marketing should not break core flows
    logger.warn({ err: err?.response?.body ?? err?.message }, "mailchimp: failed to upsert subscriber")
  }
}

/**
 * Removes a subscriber from the audience (archives them).
 * Silently no-ops when Mailchimp env vars are not configured.
 */
export async function removeSubscriber(email: string): Promise<void> {
  init()
  if (!initialised || !env.MAILCHIMP_LIST_ID) return

  const hash = emailHash(email)
  try {
    await (mailchimp.lists as any).deleteListMember(env.MAILCHIMP_LIST_ID, hash)
  } catch (err: any) {
    logger.warn({ err: err?.response?.body ?? err?.message }, "mailchimp: failed to remove subscriber")
  }
}
