/**
 * Invitation email template and sender.
 */
import { sendEmail } from "./email"

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  internal_viewer: "Internal Viewer",
  partner_viewer: "Partner",
  vendor_viewer: "Vendor",
}

interface SendInviteEmailParams {
  to: string
  inviteUrl: string
  role: string
  inviterName: string | null
}

export async function sendInviteEmail({
  to,
  inviteUrl,
  role,
  inviterName,
}: SendInviteEmailParams) {
  const roleLabel = ROLE_LABELS[role] ?? role
  const invitedBy = inviterName ?? "A team member"

  const subject = "You've been invited to Satuit Supply Portal"

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f5; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0; text-align: center;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #09090b;">Satuit Supply</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                ${invitedBy} has invited you to join the Satuit Supply portal as <strong>${roleLabel}</strong>.
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #3f3f46;">
                Click the button below to accept your invitation and set up your account.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 12px 32px; background-color: #18181b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.5; color: #71717a;">
                This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                Satuit Supply Co.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${invitedBy} has invited you to join the Satuit Supply portal as ${roleLabel}.\n\nAccept your invitation: ${inviteUrl}\n\nThis invitation expires in 7 days.`

  await sendEmail({ to, subject, html, text })
}
