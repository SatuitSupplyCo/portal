/**
 * Email utility — sends transactional email via AWS SES in production,
 * logs to console in development.
 *
 * Requires:
 *   - SES_FROM_EMAIL env var (e.g. "Satuit Supply <portal@satuitsupply.com>")
 *   - AWS credentials via IAM role (ECS task role) or env vars
 *   - SES domain/email verified in the AWS account
 */
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2"

const FROM_EMAIL =
  process.env.SES_FROM_EMAIL ?? "Satuit Supply <noreply@satuitsupply.com>"

const ses = new SESv2Client({
  region: process.env.AWS_REGION ?? "us-east-1",
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  if (process.env.NODE_ENV === "development") {
    console.log("\n─── DEV EMAIL ───────────────────────────────────")
    console.log(`  To:      ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body:    ${text ?? "(HTML only)"}`)
    console.log("─────────────────────────────────────────────────\n")
    return
  }

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: html, Charset: "UTF-8" },
            ...(text ? { Text: { Data: text, Charset: "UTF-8" } } : {}),
          },
        },
      },
    }),
  )
}
