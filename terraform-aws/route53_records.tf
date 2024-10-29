# # Route 53 Record to Associate Domain with Load Balancer
# resource "aws_route53_record" "aqitridasa_record" {
#   zone_id = aws_route53_zone.aqitridasa_zone.zone_id
#   name    = var.sub_domain_name
#   type    = "A"

#   alias {
#     name                   = aws_lb.app_lb.dns_name
#     zone_id                = aws_lb.app_lb.zone_id
#     evaluate_target_health = true
#   }
# }
