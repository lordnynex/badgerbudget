# ------------------------------------------------------------------------------
# App Runner auto scaling configuration and service
# ------------------------------------------------------------------------------

resource "aws_apprunner_auto_scaling_configuration_version" "api" {
  auto_scaling_configuration_name = "${var.service_name}-scaling"
  max_concurrency                 = var.max_concurrency
  max_size                        = var.max_size
  min_size                        = var.min_size
}

resource "aws_apprunner_service" "api" {
  service_name = var.service_name

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.api.arn

  source_configuration {
    authentication_configuration {
      access_role_arn = var.access_role_arn
    }
    image_repository {
      image_identifier      = "${var.ecr_repository_url}:${var.image_tag}"
      image_repository_type = "ECR"

      image_configuration {
        port = tostring(var.port)
        runtime_environment_variables = var.runtime_environment_variables
      }
    }
    auto_deployments_enabled = var.auto_deployments_enabled
  }

  instance_configuration {
    cpu               = var.cpu
    memory            = var.memory
    instance_role_arn = var.instance_role_arn
  }

  tags = var.tags
}
