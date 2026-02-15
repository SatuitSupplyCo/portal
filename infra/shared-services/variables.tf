variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name used as a prefix for resource names"
  type        = string
  default     = "satuit"
}

variable "prod_account_id" {
  description = "AWS account ID for the prod workload account"
  type        = string
  default     = "095194426970"
}

variable "github_org" {
  description = "GitHub organization name"
  type        = string
  default     = "SatuitSupplyCo"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "portal"
}

variable "ecr_repo_names" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["portal", "tech-packs", "storefront", "medusa", "worker"]
}
