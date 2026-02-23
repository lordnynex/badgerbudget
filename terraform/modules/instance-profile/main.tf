# IAM role for App Runner instance (runtime: SES, S3) and ECR access (pull images).
# App Runner uses tasks.apprunner.amazonaws.com as principal for instance role.
resource "aws_iam_role" "app" {
  name = "${var.name_prefix}-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = var.tags
}

# SES send + template management for verified identity/identities (least privilege)
# Send actions are scoped to identity ARNs; template actions are account-scoped (Resource "*").
resource "aws_iam_role_policy" "ses" {
  count = length(var.ses_identity_arns) > 0 ? 1 : 0

  name   = "${var.name_prefix}-ses"
  role   = aws_iam_role.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SendEmail"
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
          "ses:SendBulkTemplatedEmail"
        ]
        Resource = var.ses_identity_arns
      },
      {
        Sid    = "ManageTemplates"
        Effect = "Allow"
        Action = [
          "ses:CreateTemplate",
          "ses:GetTemplate",
          "ses:UpdateTemplate",
          "ses:DeleteTemplate",
          "ses:ListTemplates",
          "ses:TestRenderTemplate"
        ]
        Resource = "*"
      }
    ]
  })
}

# S3 read/write for given bucket ARNs
resource "aws_iam_role_policy" "s3" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0

  name   = "${var.name_prefix}-s3"
  role   = aws_iam_role.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = concat(
          var.s3_bucket_arns,
          [for arn in var.s3_bucket_arns : "${arn}/*"]
        )
      }
    ]
  })
}

# ECR pull for App Runner access role (pull images from given repos)
resource "aws_iam_role_policy" "ecr" {
  count = length(var.ecr_repository_arns) > 0 ? 1 : 0

  name   = "${var.name_prefix}-ecr"
  role   = aws_iam_role.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = var.ecr_repository_arns
      }
    ]
  })
}

# Optional instance profile for EC2 (e.g. future use)
resource "aws_iam_instance_profile" "app" {
  name = "${var.name_prefix}-app-profile"
  role = aws_iam_role.app.name
}
