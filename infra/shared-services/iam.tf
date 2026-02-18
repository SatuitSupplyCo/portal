# Reference the OIDC provider created manually in Step 6
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  github_oidc_arn = data.aws_iam_openid_connect_provider.github.arn
  repo_filter     = "repo:${var.github_org}/${var.github_repo}:*"
}

# Role: GitHub Actions can push images to ECR
resource "aws_iam_role" "gha_ecr_push" {
  name = "gha-ecr-push"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.github_oidc_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = local.repo_filter
          }
        }
      }
    ]
  })
}

# ── Role: GitHub Actions infra deploy ────────────────────────────────────────
# Can run Terraform apply in this account. Broad permissions by necessity,
# but locked to this specific repo via OIDC condition.

resource "aws_iam_role" "gha_infra_deploy" {
  name = "gha-infra-deploy-shared"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.github_oidc_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = local.repo_filter
          }
        }
      }
    ]
  })
}

# Scope this down over time as you learn what Terraform actually touches.
resource "aws_iam_role_policy_attachment" "gha_infra_deploy" {
  role       = aws_iam_role.gha_infra_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_role_policy" "gha_ecr_push" {
  name = "ecr-push"
  role = aws_iam_role.gha_ecr_push.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
        ]
        Resource = "*"
      },
      {
        Sid    = "ECRPush"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ]
        Resource = [for repo in aws_ecr_repository.apps : repo.arn]
      }
    ]
  })
}
