variable "ses_domain" {
  type        = string
  description = "Domain to verify and use for sending (e.g. nynex.io)"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for DNS records; leave empty to skip creating records (output for manual creation)"
  default     = ""
}

variable "cloudflare_zone_domain" {
  type        = string
  description = "Cloudflare zone domain (e.g. nynex.io); required when cloudflare_zone_id is set, for DNS record names"
  default     = ""
}
