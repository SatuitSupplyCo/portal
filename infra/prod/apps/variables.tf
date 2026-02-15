variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project name"
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
  description = "AWS account ID for shared-services (ECR)"
  type        = string
  default     = "126710469812"
}

# ── Portal Service ───────────────────────────────────────────────────────────

variable "portal_image_tag" {
  description = "Docker image tag for portal (set by CI/CD pipeline)"
  type        = string
  default     = "latest"
}

variable "portal_cpu" {
  description = "CPU units for portal task (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "portal_memory" {
  description = "Memory (MiB) for portal task"
  type        = number
  default     = 512
}

variable "portal_desired_count" {
  description = "Number of portal tasks to run"
  type        = number
  default     = 1
}
