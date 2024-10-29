output "db_instance_eip" {
  value       = aws_eip.db_instance_eip.public_ip
  description = "Elastic IP for the database instance of "
}

output "ui_api_instance_eip" {
  value       = aws_eip.ui_api_instance_eip.public_ip
  description = "Elastic IP for the UI/API instance of "
}

# output "acm_certificate_arn" {
#   value = aws_acm_certificate.certificate.arn
# }

# output "registered_domain_name" {
#   value = aws_route53_zone.aqitridasa_zone.name
# }

output "load_balancer_dns" {
  value = aws_lb.app_lb.dns_name
}

output "load_balancer_zone_id" {
  value = aws_lb.app_lb.zone_id
}