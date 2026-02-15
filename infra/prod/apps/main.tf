terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "satuit-terraform-state"
    key          = "prod/apps/terraform.tfstate"
    region       = "us-east-1"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "satuit"
      ManagedBy   = "terraform"
      Environment = "prod"
    }
  }
}

# Read outputs from the infra stack
data "terraform_remote_state" "infra" {
  backend = "s3"
  config = {
    bucket = "satuit-terraform-state"
    key    = "prod/infra/terraform.tfstate"
    region = "us-east-1"
  }
}

data "aws_caller_identity" "current" {}

locals {
  infra = data.terraform_remote_state.infra.outputs
}
