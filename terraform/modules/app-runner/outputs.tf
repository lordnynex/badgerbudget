output "service_arn" {
  description = "ARN of the App Runner service"
  value       = aws_apprunner_service.api.arn
}

output "service_url" {
  description = "URL of the App Runner service"
  value       = aws_apprunner_service.api.service_url
}

output "hostname" {
  description = "Hostname of the App Runner service (for DNS or Cloudflare origin)"
  value       = element(split("/", trimprefix(aws_apprunner_service.api.service_url, "https://")), 0)
}
