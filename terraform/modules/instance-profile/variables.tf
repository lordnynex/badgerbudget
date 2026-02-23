variable "name_prefix" {
  type        = string
  description = "Prefix for IAM role and instance profile names"
}

variable "s3_bucket_arns" {
  type        = list(string)
  description = "ARNs of S3 buckets the role can read/write"
  default     = []
}

variable "ecr_repository_arns" {
  type        = list(string)
  description = "ARNs of ECR repositories the role can pull from (for App Runner access role)"
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to IAM resources"
  default     = {}
}
