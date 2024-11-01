variable "application_name" {
  description = "The name of the application"
  type        = string
}

variable "owner" {
  description = "The owner of the resources"
  type        = string
}

variable "deployment_name" {
  description = "A unique name for the deployment, used as a prefix and tag"
  type        = string
}

variable "certificate_domain_name" {
  description = "The domain name for the application"
  type        = string
  default     = "tridasa.online"
}

variable "domain_name" {
  description = "The domain name for the application"
  type        = string
  default     = "tridasa.online"
}

variable "sub_domain_name" {
  description = "The domain name for the application"
  type        = string
  default     = "tridasa.online"
}

variable "region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-2"
}

variable "validation_method" {
  description = "Method for validating the SSL certificate"
  type        = string
  default     = "DNS"
}

variable "deployment_prefix" {
  description = "Prefix for naming resources"
  type        = string
  default     = "aqitridasa"
}

