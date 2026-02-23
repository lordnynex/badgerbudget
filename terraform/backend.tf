# S3 backend for Terraform state.
# Bucket/key are literals (Terraform does not allow variables in backend block).
# When changing state location, update this file and run: terraform init -reconfigure
terraform {
  backend "s3" {
    bucket  = "satyrs-tfstate"
    key     = "satyrs/terraform.tfstate"
    region  = "us-east-2"
    profile = "brandon"
  }
}
