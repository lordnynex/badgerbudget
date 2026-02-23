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

variable "ses_identity_arns" {
  type        = list(string)
  description = "ARNs of SES identities the role can send from (for least privilege); when empty, no SES policy is attached"
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to IAM resources"
  default     = {}
}
