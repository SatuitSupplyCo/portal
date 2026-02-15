# ── Portal: Secrets ──────────────────────────────────────────────────────────

data "aws_secretsmanager_secret" "auth_secret" {
  name = "satuit/auth-secret"
}

data "aws_secretsmanager_secret" "auth_google_id" {
  name = "satuit/auth-google-id"
}

data "aws_secretsmanager_secret" "auth_google_secret" {
  name = "satuit/auth-google-secret"
}

# ── Portal: ALB Target Group ─────────────────────────────────────────────────

resource "aws_lb_target_group" "portal" {
  name        = "${var.project}-${var.environment}-portal"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = local.infra.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = { Name = "${var.project}-${var.environment}-portal" }
}

# ── Portal: ALB Listener Rule ────────────────────────────────────────────────

resource "aws_lb_listener_rule" "portal" {
  listener_arn = local.infra.alb_https_listener_arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.portal.arn
  }

  condition {
    host_header {
      values = ["portal.${var.domain_name}"]
    }
  }
}

# ── Portal: DNS Record ──────────────────────────────────────────────────────

resource "aws_route53_record" "portal" {
  zone_id = local.infra.route53_zone_id
  name    = "portal.${var.domain_name}"
  type    = "A"

  alias {
    name                   = local.infra.alb_dns_name
    zone_id                = local.infra.alb_zone_id
    evaluate_target_health = true
  }
}

# ── Portal: ECS Task Definition ──────────────────────────────────────────────

resource "aws_ecs_task_definition" "portal" {
  family                   = "${var.project}-${var.environment}-portal"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.portal_cpu
  memory                   = var.portal_memory
  execution_role_arn       = local.infra.ecs_execution_role_arn
  task_role_arn            = local.infra.ecs_task_role_arn

  container_definitions = jsonencode([
    {
      name  = "portal"
      image = "${var.shared_services_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.project}/portal:${var.portal_image_tag}"

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" },
        { name = "HOSTNAME", value = "0.0.0.0" },
        { name = "NEXT_PUBLIC_APP_URL", value = "https://portal.${var.domain_name}" },
        { name = "NEXTAUTH_URL", value = "https://portal.${var.domain_name}" },
        { name = "AUTH_ALLOWED_DOMAIN", value = "satuitsupply.com" },
        { name = "REDIS_URL", value = "redis://${local.infra.redis_endpoint}:${local.infra.redis_port}" },
      ]

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = local.infra.db_secret_arn
        },
        {
          name      = "AUTH_SECRET"
          valueFrom = data.aws_secretsmanager_secret.auth_secret.arn
        },
        {
          name      = "AUTH_GOOGLE_ID"
          valueFrom = data.aws_secretsmanager_secret.auth_google_id.arn
        },
        {
          name      = "AUTH_GOOGLE_SECRET"
          valueFrom = data.aws_secretsmanager_secret.auth_google_secret.arn
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = local.infra.ecs_log_group_name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "portal"
        }
      }

      essential = true

      healthCheck = {
        command     = ["CMD-SHELL", "wget -q --spider http://localhost:3000/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = { Name = "${var.project}-${var.environment}-portal" }
}

# ── Portal: ECS Service ──────────────────────────────────────────────────────

resource "aws_ecs_service" "portal" {
  name            = "portal"
  cluster         = local.infra.ecs_cluster_arn
  task_definition = aws_ecs_task_definition.portal.arn
  desired_count   = var.portal_desired_count
  launch_type     = "FARGATE"

  enable_execute_command = true

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = local.infra.private_subnet_ids
    security_groups  = [local.infra.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.portal.arn
    container_name   = "portal"
    container_port   = 3000
  }

  # Allow GitHub Actions to update the task definition without Terraform
  # detecting drift. The pipeline updates the image tag directly.
  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = { Name = "${var.project}-${var.environment}-portal" }
}
