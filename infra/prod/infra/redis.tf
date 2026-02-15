# ── Redis Security Group ─────────────────────────────────────────────────────

resource "aws_security_group" "redis" {
  name_prefix = "${var.project}-${var.environment}-redis-"
  description = "ElastiCache Redis - allow from ECS services only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_services.id]
  }

  tags = { Name = "${var.project}-${var.environment}-redis" }

  lifecycle {
    create_before_destroy = true
  }
}

# ── ElastiCache Subnet Group ────────────────────────────────────────────────

resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project}-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

# ── ElastiCache Redis ────────────────────────────────────────────────────────
# Single node, no replication. Upgrade to a replication group later if needed.

resource "aws_elasticache_cluster" "redis" {
  cluster_id      = "${var.project}-${var.environment}"
  engine          = "redis"
  engine_version  = "7.1"
  node_type       = var.redis_node_type
  num_cache_nodes = 1
  port            = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  snapshot_retention_limit = 1
  snapshot_window          = "02:00-03:00"
  maintenance_window       = "sun:05:00-sun:06:00"

  tags = { Name = "${var.project}-${var.environment}" }
}
