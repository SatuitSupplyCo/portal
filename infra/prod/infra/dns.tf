# ── Route53 Hosted Zone ──────────────────────────────────────────────────────

resource "aws_route53_zone" "main" {
  name = var.domain_name
}

# ── Google Workspace Email Records ───────────────────────────────────────────
# These preserve your existing Google Workspace email after switching
# nameservers from Porkbun to Route53.

resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 3600

  records = [
    "1 ASPMX.L.GOOGLE.COM",
    "5 ALT1.ASPMX.L.GOOGLE.COM",
    "5 ALT2.ASPMX.L.GOOGLE.COM",
    "10 ALT3.ASPMX.L.GOOGLE.COM",
    "10 ALT4.ASPMX.L.GOOGLE.COM",
  ]
}

resource "aws_route53_record" "spf" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 3600

  records = [
    "v=spf1 include:_spf.google.com include:amazonses.com ~all",
  ]
}

resource "aws_route53_record" "dmarc" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 3600

  records = [
    "v=DMARC1; p=none; rua=mailto:dmarc@${var.domain_name}",
  ]
}

# NOTE: Google Workspace DKIM record
# You'll need to add your DKIM TXT record manually or via a separate resource.
# Get the value from Google Admin Console -> Apps -> Google Workspace -> Gmail
# -> Authenticate email -> Generate new record.
# It will be a TXT record at: google._domainkey.satuitsupply.com

# ── ACM Certificate (wildcard) ───────────────────────────────────────────────
# Covers both the root domain and all subdomains.
# CloudFront requires certs in us-east-1 -- since we're already in us-east-1,
# this cert works for both ALB and CloudFront.

resource "aws_acm_certificate" "wildcard" {
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

locals {
  cert_validation_grouped = {
    for dvo in aws_acm_certificate.wildcard.domain_validation_options :
    dvo.resource_record_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }...
  }
  cert_validation_options = {
    for k, v in local.cert_validation_grouped : k => v[0]
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = local.cert_validation_options

  zone_id = aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "wildcard" {
  certificate_arn         = aws_acm_certificate.wildcard.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}
