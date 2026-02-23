variable "repository_name" {
  type        = string
  description = "ECR repository name"
}

variable "image_retention_count" {
  type        = number
  description = "Number of images to retain in ECR (lifecycle policy)"
  default     = 5
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the repository"
  default     = {}
}
