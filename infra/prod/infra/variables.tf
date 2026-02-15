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

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "satuitsupply.com"
}

variable "shared_services_account_id" {
  description = "AWS account ID for shared-services (ECR lives here)"
  type        = string
  default     = "126710469812"
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

# ── VPC ──────────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

# ── RDS ──────────────────────────────────────────────────────────────────────

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.small"
}

variable "db_name" {
  description = "Name of the default database"
  type        = string
  default     = "satuit"
}

variable "db_username" {
  description = "Master username for the database"
  type        = string
  default     = "satuit_admin"
}

# ── Redis ────────────────────────────────────────────────────────────────────

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t4g.micro"
}
