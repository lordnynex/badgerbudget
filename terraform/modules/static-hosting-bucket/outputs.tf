output "bucket_id" {
  description = "ID of the S3 bucket"
  value       = aws_s3_bucket.this.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.this.arn
}

output "website_endpoint" {
  description = "Website endpoint for the bucket (when used with website hosting)"
  value       = aws_s3_bucket_website_configuration.this.website_endpoint
}

output "website_domain" {
  description = "Website domain for the bucket"
  value       = aws_s3_bucket_website_configuration.this.website_domain
}
