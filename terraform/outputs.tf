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
  value       = var.create_app_runner && var.create_ecr_repository ? aws_apprunner_service.api[0].service_url : null
}

output "instance_profile_role_name" {
  description = "Name of the IAM role used by App Runner"
  value       = module.instance_profile.role_name
}
