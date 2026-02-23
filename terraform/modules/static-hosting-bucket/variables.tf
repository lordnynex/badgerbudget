variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket for static hosting"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the bucket"
  default     = {}
}
