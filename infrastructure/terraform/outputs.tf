output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ecr_repository_api_url" {
  description = "URL of ECR repository for backend API"
  value       = aws_ecr_repository.api.repository_url
}

output "ecr_repository_web_url" {
  description = "URL of ECR repository for frontend web"
  value       = aws_ecr_repository.web.repository_url
}
