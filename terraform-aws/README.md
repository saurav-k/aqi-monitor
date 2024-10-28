To pass all variable values from the command line, you can use the `-var` option with the `terraform apply` or `terraform plan` commands. Here’s the process:

### Example Command to Run Terraform

```bash
terraform init \
  -var "application_name=aqi_tridasa" \
  -var "owner=saurav" \
  -var "deployment_name=aqi_tridasa_v1"


terraform plan \
  -var "application_name=aqi_tridasa" \
  -var "owner=saurav" \
  -var "deployment_name=aqi_tridasa_v1"

terraform apply \
  -var "application_name=aqi_tridasa" \
  -var "owner=saurav" \
  -var "deployment_name=aqi_tridasa_v1"
```

### Explanation:
- `terraform init`: Initializes the Terraform environment (downloads providers, configures backends, etc.)
- `terraform apply`: Executes the plan and applies the changes.
  - `-var "application_name=myApp"`: Passes the value `"myApp"` to the `application_name` variable.
  - `-var "owner=myOwner"`: Passes the value `"myOwner"` to the `owner` variable.
  - `-var "deployment_name=myDeployment"`: Passes the value `"myDeployment"` to the `deployment_name` variable.

### Optional: `terraform plan`
If you want to preview the changes before applying them, you can use `terraform plan` with the same variables:

```bash
terraform plan \
  -var "application_name=myApp" \
  -var "owner=myOwner" \
  -var "deployment_name=myDeployment"
```