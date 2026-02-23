# Backend / provider (tf_state_* used for docs; backend config is in backend.tf)
variable "aws_profile" {
  type        = string
  description = "AWS CLI profile name for credentials"
  default     = "brandon"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "tf_state_bucket" {
  type        = string
  description = "S3 bucket for Terraform state (must match backend.tf if changed)"
  default     = "satyrs-tfstate"
}

variable "tf_state_key" {
  type        = string
  description = "S3 object key for Terraform state"
  default     = "satyrs/terraform.tfstate"
}

# Static hosting
variable "create_static_hosting_bucket" {
  type        = bool
  description = "Create S3 bucket for static hosting"
  default     = true
}

variable "static_hosting_bucket_name" {
  type        = string
  description = "Name of the static hosting S3 bucket"
  default     = "satyrsmc.org"
}

# ECR
variable "create_ecr_repository" {
  type        = bool
  description = "Create ECR repository for satyrsmc API"
  default     = true
}

variable "ecr_repository_name" {
  type        = string
  description = "ECR repository name"
  default     = "satyrsmc-api"
}

variable "ecr_image_retention_count" {
  type        = number
  description = "Number of images to retain in ECR (lifecycle policy)"
  default     = 5
}

# App Runner
variable "create_app_runner" {
  type        = bool
  description = "Create App Runner service for the API"
  default     = true
}

variable "app_runner_service_name" {
  type        = string
  description = "App Runner service name"
  default     = "satyrsmc-api"
}

variable "app_runner_cpu" {
  type        = string
  description = "App Runner CPU allocation (e.g. 1 vCPU)"
  default     = "1 vCPU"
}

variable "app_runner_memory" {
  type        = string
  description = "App Runner memory allocation"
  default     = "2 GB"
}

variable "app_runner_port" {
  type        = number
  description = "Port the API listens on"
  default     = 3000
}

variable "app_runner_image_tag" {
  type        = string
  description = "Docker image tag for App Runner (e.g. latest)"
  default     = "latest"
}

variable "app_runner_auto_deployments_enabled" {
  type        = bool
  description = "Enable automatic deployments when a new image is pushed to the ECR repository"
  default     = true
}

variable "app_runner_min_size" {
  type        = number
  description = "Minimum number of App Runner instances (set to 1 with max_size 1 for single instance)"
  default     = 1
}

variable "app_runner_max_size" {
  type        = number
  description = "Maximum number of App Runner instances (set to 1 to cap at a single instance)"
  default     = 1
}

variable "app_runner_max_concurrency" {
  type        = number
  description = "Maximum concurrent requests per instance before scaling up"
  default     = 20
}

# Instance profile / app role
variable "instance_profile_name_prefix" {
  type        = string
  description = "Prefix for IAM role and instance profile names"
  default     = "satyrsmc"
}

# CI/CD user
variable "cicd_username" {
  type        = string
  description = "IAM user name for CI/CD"
  default     = "satyrsmc-cicd"
}

# Cloudflare (DNS, proxy, cache for static site and API)
variable "enable_cloudflare" {
  type        = bool
  description = "Create Cloudflare DNS records and cache rules for frontend/API"
  default     = true
}

variable "cloudflare_zone_domain" {
  type        = string
  description = "Cloudflare zone domain (e.g. nynex.io) for DNS and cache"
  default     = "nynex.io"
}

variable "cloudflare_frontend_host" {
  type        = string
  description = "Hostname for the static site behind Cloudflare (e.g. satyrs.nynex.io)"
  default     = "satyrs.nynex.io"
}

variable "cloudflare_api_host" {
  type        = string
  description = "Hostname for the App Runner API (e.g. satyrs-api.nynex.io)"
  default     = "satyrs-api.nynex.io"
}

variable "cloudflare_api_proxied" {
  type        = bool
  description = "Proxy API traffic through Cloudflare (false = DNS only, recommended for App Runner)"
  default     = false
}

variable "cloudflare_cache_edge_ttl_seconds" {
  type        = number
  description = "Edge cache TTL in seconds for the static frontend (e.g. 3600 = 1 hour)"
  default     = 3600
}

# Tags
variable "tags" {
  type        = map(string)
  description = "Tags applied to resources"
  default     = {}
}
