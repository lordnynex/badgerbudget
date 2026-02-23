output "domain_identity_arn" {
  description = "ARN of the SES domain identity (for IAM policy scoping)"
  value       = aws_ses_domain_identity.main.arn
}

output "from_email" {
  description = "Suggested From address (e.g. noreply@<domain>)"
  value       = "noreply@${var.ses_domain}"
}

output "verification_token" {
  description = "SES domain verification token (for manual TXT record if not using Cloudflare)"
  value       = aws_ses_domain_identity.main.verification_token
}

output "dkim_tokens" {
  description = "SES DKIM tokens (for manual CNAME records if not using Cloudflare)"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "dkim_records" {
  description = "List of DKIM CNAME name/value for manual DNS"
  value = [
    for token in aws_ses_domain_dkim.main.dkim_tokens : {
      name  = "${token}._domainkey.${var.ses_domain}"
      value = "${token}.dkim.amazonses.com"
    }
  ]
}
