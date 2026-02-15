output "ecr_repository_urls" {
  description = "Map of app name to ECR repository URL"
  value       = { for k, v in aws_ecr_repository.apps : k => v.repository_url }
}

output "gha_ecr_push_role_arn" {
  description = "IAM role ARN for GitHub Actions to push to ECR"
  value       = aws_iam_role.gha_ecr_push.arn
}
