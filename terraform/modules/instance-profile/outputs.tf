output "role_arn" {
  description = "ARN of the IAM role (use as App Runner instance role)"
  value       = aws_iam_role.app.arn
}

output "role_name" {
  description = "Name of the IAM role"
  value       = aws_iam_role.app.name
}

output "instance_profile_arn" {
  description = "ARN of the instance profile (for EC2 if needed)"
  value       = aws_iam_instance_profile.app.arn
}

output "instance_profile_name" {
  description = "Name of the instance profile"
  value       = aws_iam_instance_profile.app.name
}
