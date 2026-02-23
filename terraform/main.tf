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
}

# ---------------------------------------------------------------------------
# ECR repository (optional)
# ---------------------------------------------------------------------------
resource "aws_ecr_repository" "api" {
  count = var.create_ecr_repository ? 1 : 0

  name                 = var.ecr_repository_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

resource "aws_ecr_lifecycle_policy" "api" {
  count = var.create_ecr_repository ? 1 : 0

  repository = aws_ecr_repository.api[0].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.ecr_image_retention_count} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.ecr_image_retention_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

locals {
  ecr_repository_arn = var.create_ecr_repository ? aws_ecr_repository.api[0].arn : null
  ecr_repository_url = var.create_ecr_repository ? aws_ecr_repository.api[0].repository_url : null
}

# ---------------------------------------------------------------------------
# Instance profile / app role (SES + S3 + ECR pull for App Runner)
# ---------------------------------------------------------------------------
module "instance_profile" {
  source = "./modules/instance-profile"

  name_prefix         = var.instance_profile_name_prefix
  s3_bucket_arns      = local.static_bucket_arns_for_profile
  ecr_repository_arns = var.create_ecr_repository ? [aws_ecr_repository.api[0].arn] : []
  tags                = var.tags
}

# ---------------------------------------------------------------------------
# App Runner auto scaling (optional, used when App Runner service is created)
# ---------------------------------------------------------------------------
resource "aws_apprunner_auto_scaling_configuration_version" "api" {
  count = var.create_app_runner && var.create_ecr_repository ? 1 : 0

  auto_scaling_configuration_name = "${var.app_runner_service_name}-scaling"
  max_concurrency                 = var.app_runner_max_concurrency
  max_size                        = var.app_runner_max_size
  min_size                        = var.app_runner_min_size
}

# ---------------------------------------------------------------------------
# App Runner (optional)
# ---------------------------------------------------------------------------
resource "aws_apprunner_service" "api" {
  count = var.create_app_runner && var.create_ecr_repository ? 1 : 0

  service_name = var.app_runner_service_name

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.api[0].arn

  source_configuration {
    authentication_configuration {
      access_role_arn = module.instance_profile.role_arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.api[0].repository_url}:${var.app_runner_image_tag}"
      image_repository_type = "ECR"

      image_configuration {
        port = tostring(var.app_runner_port)
      }
    }
    auto_deployments_enabled = var.app_runner_auto_deployments_enabled
  }

  instance_configuration {
    cpu               = var.app_runner_cpu
    memory            = var.app_runner_memory
    instance_role_arn = module.instance_profile.role_arn
  }

  tags = var.tags
}

locals {
  app_runner_service_arn   = var.create_app_runner && var.create_ecr_repository ? aws_apprunner_service.api[0].arn : null
  app_runner_hostname     = var.create_app_runner && var.create_ecr_repository ? element(split("/", trimprefix(aws_apprunner_service.api[0].service_url, "https://")), 0) : ""
  static_bucket_endpoint   = var.create_static_hosting_bucket ? module.static_hosting_bucket[0].website_endpoint : ""
}

# ---------------------------------------------------------------------------
# Cloudflare (DNS + cache for frontend and API)
# ---------------------------------------------------------------------------
module "cloudflare" {
  source = "./modules/cloudflare-static-and-api"
  count  = var.enable_cloudflare ? 1 : 0

  zone_domain         = var.cloudflare_zone_domain
  frontend_host       = var.cloudflare_frontend_host
  frontend_origin_host = local.static_bucket_endpoint
  api_host            = var.cloudflare_api_host
  api_origin_host     = local.app_runner_hostname
  api_proxied         = var.cloudflare_api_proxied
  enable_frontend     = var.create_static_hosting_bucket
  enable_api          = var.create_app_runner && var.create_ecr_repository
}

# ---------------------------------------------------------------------------
# CI/CD IAM user (ECR push, S3, App Runner deploy)
# ---------------------------------------------------------------------------
module "cicd_user" {
  source = "./modules/cicd-user"

  username                     = var.cicd_username
  ecr_repository_arns          = var.create_ecr_repository ? [aws_ecr_repository.api[0].arn] : []
  s3_bucket_arns               = local.static_bucket_arns_for_profile
  app_runner_service_arn       = local.app_runner_service_arn != null ? local.app_runner_service_arn : ""
  app_runner_instance_role_arn = module.instance_profile.role_arn
  app_runner_access_role_arn   = module.instance_profile.role_arn
  tags                         = var.tags
}
