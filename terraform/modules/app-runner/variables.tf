variable "service_name" {
  type        = string
  description = "App Runner service name"
}

variable "ecr_repository_url" {
  type        = string
  description = "ECR repository URL (e.g. from ECR module repository_url output)"
}

variable "image_tag" {
  type        = string
  description = "Docker image tag for App Runner (e.g. latest)"
  default     = "latest"
}

variable "port" {
  type        = number
  description = "Port the API listens on"
  default     = 3000
}

variable "cpu" {
  type        = string
  description = "App Runner CPU allocation (e.g. 256 or 1 vCPU)"
  default     = "256"
}

variable "memory" {
  type        = string
  description = "App Runner memory allocation (e.g. 512 or 2 GB)"
  default     = "512"
}

variable "min_size" {
  type        = number
  description = "Minimum number of App Runner instances"
  default     = 1
}

variable "max_size" {
  type        = number
  description = "Maximum number of App Runner instances"
  default     = 1
}

variable "max_concurrency" {
  type        = number
  description = "Maximum concurrent requests per instance before scaling up"
  default     = 20
}

variable "auto_deployments_enabled" {
  type        = bool
  description = "Enable automatic deployments when a new image is pushed to ECR"
  default     = false
}

variable "instance_role_arn" {
  type        = string
  description = "IAM role ARN for App Runner instance (runtime permissions: SES, S3, etc.)"
}

variable "access_role_arn" {
  type        = string
  description = "IAM role ARN for App Runner to pull images from ECR"
}

variable "runtime_environment_variables" {
  type        = map(string)
  description = "Environment variables passed to the running container"
  default     = {}
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the App Runner service"
  default     = {}
}
