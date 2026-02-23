output "frontend_url" {
  description = "URL of the frontend (static site) behind Cloudflare"
  value       = var.frontend_host != "" ? "https://${var.frontend_host}" : null
}

output "api_url" {
  description = "URL of the API behind Cloudflare DNS"
  value       = var.api_host != "" ? "https://${var.api_host}" : null
}
