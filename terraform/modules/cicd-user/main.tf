resource "aws_iam_user" "this" {
  name = var.username
  path = "/"

  tags = var.tags
}

resource "aws_iam_access_key" "this" {
  user = aws_iam_user.this.name
}

# Combined policy: ECR push, S3, App Runner deploy
# Use [for s in [...] : s if s != null] to filter nulls (compact() only works on lists of strings).
resource "aws_iam_user_policy" "cicd" {
  name   = "${var.username}-cicd"
  user   = aws_iam_user.this.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = concat(
      # ECR: GetAuthorizationToken (account-level) + push to repos
      [for s in [
        length(var.ecr_repository_arns) > 0 ? {
          Effect   = "Allow"
          Action   = "ecr:GetAuthorizationToken"
          Resource = "*"
        } : null,
        length(var.ecr_repository_arns) > 0 ? {
          Effect = "Allow"
          Action = [
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload"
          ]
          Resource = var.ecr_repository_arns
        } : null
      ] : s if s != null],
      # S3: read/write on given buckets
      [for s in [
        length(var.s3_bucket_arns) > 0 ? {
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
        } : null
      ] : s if s != null],
      # App Runner: start deployment and describe
      [for s in [
        var.app_runner_service_arn != "" ? {
          Effect   = "Allow"
          Action   = ["apprunner:StartDeployment", "apprunner:DescribeService", "apprunner:DescribeDeployment"]
          Resource = var.app_runner_service_arn
        } : null
      ] : s if s != null],
      # PassRole for App Runner instance and access roles (required to update service)
      [for s in [
        var.app_runner_instance_role_arn != "" || var.app_runner_access_role_arn != "" ? {
          Effect   = "Allow"
          Action   = "iam:PassRole"
          Resource = compact([var.app_runner_instance_role_arn, var.app_runner_access_role_arn])
          Condition = {
            StringEquals = {
              "iam:PassedToService" = "apprunner.amazonaws.com"
            }
          }
        } : null
      ] : s if s != null]
    )
  })
}
