output "portal_url" {
  description = "Portal URL"
  value       = "https://portal.${var.domain_name}"
}

output "portal_service_name" {
  description = "ECS service name for portal"
  value       = aws_ecs_service.portal.name
}

output "portal_task_definition_arn" {
  description = "Portal task definition ARN"
  value       = aws_ecs_task_definition.portal.arn
}
