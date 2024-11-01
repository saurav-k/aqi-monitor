# # acm_certificate.tf
# resource "aws_acm_certificate" "certificate" {
#   domain_name       = var.certificate_domain_name       # e.g., "aqitridasa.com"
#   validation_method = "DNS"                 # DNS validation method
  
#   tags = {
#     Name = "${var.deployment_prefix}-certificate"
#   }
# }

# Find a certificate issued by (not imported into) ACM
data "aws_acm_certificate" "amazon_issued" {
  domain      = "www.tridasa.online"
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}
