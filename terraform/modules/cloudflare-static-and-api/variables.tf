variable "zone_domain" {
  type        = string
  description = "Cloudflare zone domain (e.g. nynex.io)"
}

variable "frontend_host" {
  type        = string
  description = "Full hostname for the static site (e.g. satyrs.nynex.io)"
  default     = ""
}

variable "frontend_origin_host" {
  type        = string
  description = "Origin hostname for the static site (e.g. S3 website endpoint)"
  default     = ""
}

variable "api_host" {
  type        = string
  description = "Full hostname for the API (e.g. satyrs-api.nynex.io)"
  default     = ""
}

variable "api_origin_host" {
  type        = string
  description = "Origin hostname for the API (e.g. App Runner service hostname)"
  default     = ""
}

variable "api_proxied" {
  type        = bool
  description = "Whether to proxy API traffic through Cloudflare"
  default     = false
}

variable "enable_frontend" {
  type        = bool
  description = "Create DNS record and cache rule for the frontend"
  default     = true
}

variable "enable_api" {
  type        = bool
  description = "Create DNS record for the API"
  default     = true
}
