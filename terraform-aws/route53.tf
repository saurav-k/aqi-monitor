# Route 53 Hosted Zone (Skip if already exists)
resource "aws_route53_zone" "tridasa_online" {
  name = "tridasa.online"
}

resource "aws_route53_record" "www_alias" {
  zone_id = aws_route53_zone.tridasa_online.id
  name    = "www"  # Points www.tridasa.online
  type    = "A"

  alias {
    name                   = aws_lb.app_lb.dns_name
    zone_id                = aws_lb.app_lb.zone_id
    evaluate_target_health = true
  }
}
