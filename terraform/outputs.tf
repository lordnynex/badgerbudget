# CI/CD credentials (capture secret once after first apply: terraform output cicd_secret_access_key)
output "cicd_access_key_id" {
  description = "CI/CD IAM user access key ID"
  value       = module.cicd_user.access_key_id
}

output "cicd_secret_access_key" {
  description = "CI/CD IAM user secret access key; capture once and store in CI secrets"
  value       = module.cicd_user.secret_access_key
  sensitive   = true
}

# Optional resource outputs
output "static_hosting_bucket_name" {
  description = "Name of the static hosting S3 bucket (if created)"
  value       = var.create_static_hosting_bucket ? module.static_hosting_bucket[0].bucket_id : null
}

output "static_hosting_website_endpoint" {
  description = "Website endpoint for the static bucket (if created)"
  value       = var.create_static_hosting_bucket ? module.static_hosting_bucket[0].website_endpoint : null
}

output "ecr_repository_url" {
  description = "ECR repository URL for the API (if created)"
  value       = local.ecr_repository_url
}

output "app_runner_service_url" {
  description = "App Runner service URL (if created)"
  value       = var.create_app_runner && var.create_ecr_repository ? module.app_runner[0].service_url : null
}

output "instance_profile_role_name" {
  description = "Name of the IAM role used by App Runner"
  value       = module.instance_profile.role_name
}

# Cloudflare (when enable_cloudflare = true)
output "cloudflare_frontend_url" {
  description = "Frontend URL behind Cloudflare (e.g. https://satyrs.nynex.io)"
  value       = length(module.cloudflare) > 0 ? module.cloudflare[0].frontend_url : null
}

output "cloudflare_api_url" {
  description = "API URL behind Cloudflare DNS (e.g. https://satyrs-api.nynex.io)"
  value       = length(module.cloudflare) > 0 ? module.cloudflare[0].api_url : null
}

output "static_origin_hostname" {
  description = "S3 website endpoint hostname (origin for Cloudflare)"
  value       = var.create_static_hosting_bucket ? module.static_hosting_bucket[0].website_endpoint : null
}

# SES (when enable_ses = true)
output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity (if created)"
  value       = var.enable_ses ? module.ses[0].domain_identity_arn : null
}

output "ses_from_email" {
  description = "Suggested From address for sending email (e.g. noreply@domain)"
  value       = var.enable_ses ? module.ses[0].from_email : null
}

output "ses_dkim_records" {
  description = "DKIM CNAME records for manual DNS (when SES DNS not managed by Terraform)"
  value       = var.enable_ses ? module.ses[0].dkim_records : null
}
