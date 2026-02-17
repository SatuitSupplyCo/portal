# ── SES Domain Identity ──────────────────────────────────────────────────────
# Verifies satuitsupply.com for sending transactional email (invitations, etc.)
# Domain verification is handled automatically via the DKIM CNAME records below.

resource "aws_sesv2_email_identity" "main" {
  email_identity = var.domain_name

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }
}

# ── SES DKIM (3 CNAME records) ──────────────────────────────────────────────
# AWS generates 3 DKIM tokens; each becomes a CNAME for email authentication.
# These also serve as domain verification — no separate TXT record needed.

resource "aws_route53_record" "ses_dkim" {
  count = 3

  zone_id = aws_route53_zone.main.zone_id
  name    = "${aws_sesv2_email_identity.main.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${aws_sesv2_email_identity.main.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

# ── SES Mail-From subdomain ─────────────────────────────────────────────────
# Uses a custom MAIL FROM domain so bounce/complaint handling works properly
# and SPF alignment passes for DMARC.

resource "aws_sesv2_email_identity_mail_from_attributes" "main" {
  email_identity   = aws_sesv2_email_identity.main.email_identity
  mail_from_domain = "mail.${var.domain_name}"
}

resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "MX"
  ttl     = 300
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

resource "aws_route53_record" "ses_mail_from_spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:amazonses.com ~all"]
}
