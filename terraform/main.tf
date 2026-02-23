# Provider
provider "aws" {
  profile = var.aws_profile
  region  = var.aws_region
}

provider "cloudflare" {}

# ---------------------------------------------------------------------------
# Static hosting S3 bucket (optional, reusable module)
# ---------------------------------------------------------------------------
module "static_hosting_bucket" {
  source = "./modules/static-hosting-bucket"
  count  = var.create_static_hosting_bucket ? 1 : 0

  bucket_name = var.static_hosting_bucket_name
  tags        = var.tags
}

locals {
  static_bucket_arn              = var.create_static_hosting_bucket ? module.static_hosting_bucket[0].bucket_arn : null
  static_bucket_arns_for_profile = var.create_static_hosting_bucket ? [module.static_hosting_bucket[0].bucket_arn] : []
  ses_domain                     = var.ses_domain != "" ? var.ses_domain : var.cloudflare_zone_domain
  ses_in_cloudflare_zone         = var.enable_cloudflare && var.enable_ses && (local.ses_domain == var.cloudflare_zone_domain || endswith(local.ses_domain, ".${var.cloudflare_zone_domain}"))
}

# ---------------------------------------------------------------------------
# ECR repository (optional)
# ---------------------------------------------------------------------------
module "ecr" {
  source = "./modules/ecr"
  count  = var.create_ecr_repository ? 1 : 0

  repository_name         = var.ecr_repository_name
  image_retention_count   = var.ecr_image_retention_count
  tags                    = var.tags
}

locals {
  ecr_repository_arn = var.create_ecr_repository ? module.ecr[0].repository_arn : null
  ecr_repository_url = var.create_ecr_repository ? module.ecr[0].repository_url : null
}

# ---------------------------------------------------------------------------
# SES (domain identity + DKIM, optional Cloudflare DNS)
# ---------------------------------------------------------------------------
module "ses" {
  source = "./modules/ses"
  count  = var.enable_ses ? 1 : 0

  ses_domain             = local.ses_domain
  cloudflare_zone_id     = local.ses_in_cloudflare_zone ? module.cloudflare[0].zone_id : ""
  cloudflare_zone_domain = local.ses_in_cloudflare_zone ? var.cloudflare_zone_domain : ""
}

# ---------------------------------------------------------------------------
# Instance profile / app role (SES + S3 + ECR pull for App Runner)
# ---------------------------------------------------------------------------
module "instance_profile" {
  source = "./modules/instance-profile"

  name_prefix         = var.instance_profile_name_prefix
  s3_bucket_arns      = local.static_bucket_arns_for_profile
  ecr_repository_arns = var.create_ecr_repository ? [module.ecr[0].repository_arn] : []
  ses_identity_arns   = var.enable_ses ? [module.ses[0].domain_identity_arn] : []
  tags                = var.tags
}

# ---------------------------------------------------------------------------
# App Runner (optional; requires ECR)
# ---------------------------------------------------------------------------
module "app_runner" {
  source = "./modules/app-runner"
  count  = var.create_app_runner && var.create_ecr_repository ? 1 : 0

  service_name                   = var.app_runner_service_name
  ecr_repository_url             = module.ecr[0].repository_url
  image_tag                      = var.app_runner_image_tag
  port                           = var.app_runner_port
  cpu                            = var.app_runner_cpu
  memory                         = var.app_runner_memory
  min_size                       = var.app_runner_min_size
  max_size                       = var.app_runner_max_size
  max_concurrency                = var.app_runner_max_concurrency
  auto_deployments_enabled       = var.app_runner_auto_deployments_enabled
  instance_role_arn              = module.instance_profile.role_arn
  access_role_arn                = module.instance_profile.role_arn
  runtime_environment_variables  = var.enable_ses ? {
    AWS_REGION     = var.aws_region
    SES_FROM_EMAIL = "noreply@${local.ses_domain}"
  } : {}
  tags                           = var.tags
}

locals {
  app_runner_service_arn = var.create_app_runner && var.create_ecr_repository ? module.app_runner[0].service_arn : null
  app_runner_hostname   = var.create_app_runner && var.create_ecr_repository ? module.app_runner[0].hostname : ""
  static_bucket_endpoint = var.create_static_hosting_bucket ? module.static_hosting_bucket[0].website_endpoint : ""
}

# ---------------------------------------------------------------------------
# Cloudflare (DNS + cache for frontend and API)
# ---------------------------------------------------------------------------
module "cloudflare" {
  source = "./modules/cloudflare-static-and-api"
  count  = var.enable_cloudflare ? 1 : 0

  zone_domain              = var.cloudflare_zone_domain
  frontend_host            = var.cloudflare_frontend_host
  frontend_origin_host     = local.static_bucket_endpoint
  api_host                 = var.cloudflare_api_host
  api_origin_host          = local.app_runner_hostname
  api_proxied              = var.cloudflare_api_proxied
  cache_edge_ttl_seconds   = var.cloudflare_cache_edge_ttl_seconds
  enable_frontend          = var.create_static_hosting_bucket
  enable_api               = var.create_app_runner && var.create_ecr_repository
}

# ---------------------------------------------------------------------------
# CI/CD IAM user (ECR push, S3, App Runner deploy)
# ---------------------------------------------------------------------------
module "cicd_user" {
  source = "./modules/cicd-user"

  username                     = var.cicd_username
  ecr_repository_arns          = var.create_ecr_repository ? [module.ecr[0].repository_arn] : []
  s3_bucket_arns               = local.static_bucket_arns_for_profile
  app_runner_service_arn       = local.app_runner_service_arn != null ? local.app_runner_service_arn : ""
  app_runner_instance_role_arn = module.instance_profile.role_arn
  app_runner_access_role_arn   = module.instance_profile.role_arn
  tags                         = var.tags
}
