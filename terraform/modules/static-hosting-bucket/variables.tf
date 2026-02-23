variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket for static hosting"
}

variable "error_document" {
  type        = string
  description = "Object key for the website error document. Use index.html for SPA/React Router so all routes fall back to the app."
  default     = "index.html"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the bucket"
  default     = {}
}
