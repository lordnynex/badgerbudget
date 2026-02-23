output "user_arn" {
  description = "ARN of the CI/CD IAM user"
  value       = aws_iam_user.this.arn
}

output "access_key_id" {
  description = "Access key ID for the CI/CD user"
  value       = aws_iam_access_key.this.id
}

output "secret_access_key" {
  description = "Secret access key (capture once after first apply)"
  value       = aws_iam_access_key.this.secret
  sensitive   = true
}
