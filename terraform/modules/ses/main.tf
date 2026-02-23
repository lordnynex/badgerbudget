# ------------------------------------------------------------------------------
# AWS SES domain identity and DKIM for sending email
# ------------------------------------------------------------------------------

resource "aws_ses_domain_identity" "main" {
  domain = var.ses_domain
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# Domain verification TXT record (required for verification to succeed)
resource "cloudflare_dns_record" "ses_verification" {
  count = var.cloudflare_zone_id != "" && var.cloudflare_zone_domain != "" ? 1 : 0

  zone_id = var.cloudflare_zone_id
  name    = replace("_amazonses.${var.ses_domain}", ".${var.cloudflare_zone_domain}", "")
  type    = "TXT"
  content = aws_ses_domain_identity.main.verification_token
  ttl     = 3600
}

# DKIM CNAME records (SES always returns 3 tokens; count must be known at plan time)
resource "cloudflare_dns_record" "ses_dkim" {
  count = var.cloudflare_zone_id != "" && var.cloudflare_zone_domain != "" ? 3 : 0

  zone_id = var.cloudflare_zone_id
  name    = replace("${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${var.ses_domain}", ".${var.cloudflare_zone_domain}", "")
  type    = "CNAME"
  content = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"
  ttl     = 3600
}

resource "aws_ses_domain_identity_verification" "main" {
  count = var.cloudflare_zone_id != "" && var.cloudflare_zone_domain != "" ? 1 : 0

  domain = aws_ses_domain_identity.main.id

  depends_on = [cloudflare_dns_record.ses_verification]
}
