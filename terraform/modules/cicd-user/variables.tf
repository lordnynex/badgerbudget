variable "username" {
  type        = string
  description = "IAM user name for CI/CD"
}

variable "ecr_repository_arns" {
  type        = list(string)
  description = "ARNs of ECR repositories the user can push to"
  default     = []
}

variable "s3_bucket_arns" {
  type        = list(string)
  description = "ARNs of S3 buckets the user can read/write"
  default     = []
}

variable "app_runner_service_arn" {
  type        = string
  description = "ARN of App Runner service for deployment (optional)"
  default     = ""
}

variable "app_runner_instance_role_arn" {
  type        = string
  description = "ARN of IAM role used by App Runner (for iam:PassRole)"
  default     = ""
}

variable "app_runner_access_role_arn" {
  type        = string
  description = "ARN of IAM role used by App Runner for ECR access (for iam:PassRole)"
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to IAM user"
  default     = {}
}
