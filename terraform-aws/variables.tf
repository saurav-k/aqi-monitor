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
