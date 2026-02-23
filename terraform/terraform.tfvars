# AWS provider
aws_profile = "brandon"
aws_region  = "us-east-2"

# State (keep in sync with backend.tf when changing bucket/key)
tf_state_bucket = "satyrs-tfstate"
tf_state_key    = "satyrs/terraform.tfstate"

# Static hosting
create_static_hosting_bucket = true
static_hosting_bucket_name   = "satyrsmc.org"

# ECR
create_ecr_repository     = true
ecr_repository_name       = "satyrsmc-api"
ecr_image_retention_count = 5

# App Runner (cheap defaults)
create_app_runner                   = true
app_runner_service_name             = "satyrsmc-api"
app_runner_cpu                      = "256"
app_runner_memory                   = "512"
app_runner_port                     = 3000
app_runner_image_tag                = "latest"
app_runner_auto_deployments_enabled = false
app_runner_min_size                 = 1
app_runner_max_size                 = 1
app_runner_max_concurrency          = 20

# Instance profile / role
instance_profile_name_prefix = "satyrsmc"

# CI/CD
cicd_username = "satyrsmc-cicd"

# Cloudflare (nynex.io test subdomain)
cloudflare_zone_domain             = "nynex.io"
cloudflare_frontend_host           = "satyrs.nynex.io"
cloudflare_api_host                = "satyrs-api.nynex.io"
cloudflare_api_proxied             = false
cloudflare_cache_edge_ttl_seconds  = 3600

# Optional tags
tags = {}
