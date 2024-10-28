output "db_instance_eip" {
  value       = aws_eip.db_instance_eip.public_ip
  description = "Elastic IP for the database instance of "
}

output "ui_api_instance_eip" {
  value       = aws_eip.ui_api_instance_eip.public_ip
  description = "Elastic IP for the UI/API instance of "
}
