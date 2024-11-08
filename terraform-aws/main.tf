provider "aws" {
  region = "ap-south-2"
  profile = "aqi"
}

locals {
  key_name = "${var.application_name}-${var.owner}"
  prefix   = var.deployment_name
}

# Create VPC
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${local.prefix}-main_vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
  tags = {
    Name = "${local.prefix}-igw"
  }
}

# Create Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone = "ap-south-2c"
  tags = {
    Name = "${local.prefix}-public_subnet"
  }
}

# Create Public Subnet
resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone = "ap-south-2b"
  tags = {
    Name = "${local.prefix}-public_subnet-2"
  }
}

# Create Route Table
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = {
    Name = "${local.prefix}-public_rt"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "public_rt_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "public_rt_assoc_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group for allowing SSH, HTTP, and Postgres access
resource "aws_security_group" "instance_sg" {
  name = local.key_name
  vpc_id = aws_vpc.main_vpc.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8082
    to_port     = 8082
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
    ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${local.prefix}-instance_sg"
  }
}

# Key Pair Generation
resource "tls_private_key" "private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "ssh_pem_file" {
  filename = "${local.key_name}.pem"
  content = tls_private_key.private_key.private_key_pem
  file_permission = "0600"
}

resource "aws_key_pair" "key_pair" {
  key_name   = local.key_name
  public_key = tls_private_key.private_key.public_key_openssh
}

# EC2 Instance for DB (Postgres)
resource "aws_instance" "db_instance" {
  ami           = "ami-0ab17636267b1f82f"  # Replace with a suitable AMI ID
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.instance_sg.id]
  key_name      = aws_key_pair.key_pair.key_name

  # Attach Elastic IP
  # associate_public_ip_address = true

  tags = {
    Name = "${local.prefix}-db_instance"
  }
}

resource "aws_eip" "db_instance_eip" {
  instance = aws_instance.db_instance.id
  tags = {
    Name = "${local.prefix}-db_eip"
  }
}

resource "aws_eip_association" "db_instance_eip_association" {
  instance_id = aws_instance.db_instance.id
  allocation_id = aws_eip.db_instance_eip.id
}

# EC2 Instance for UI/API
resource "aws_instance" "ui_api_instance" {
  ami           = "ami-0ab17636267b1f82f"  # Replace with a suitable AMI ID
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.instance_sg.id]
  key_name      = aws_key_pair.key_pair.key_name

  # Attach Elastic IP
  # associate_public_ip_address = true

  tags = {
    Name = "${local.prefix}-ui_api_instance"
  }
}

resource "aws_eip" "ui_api_instance_eip" {
  instance = aws_instance.ui_api_instance.id
  tags = {
    Name = "${local.prefix}-ui_api_eip"
  }
}

resource "aws_eip_association" "ui_api_instance_eip_association" {
  instance_id = aws_instance.ui_api_instance.id
  allocation_id = aws_eip.ui_api_instance_eip.id
}


locals {
  sanitized_name_prefix = lower(replace(replace(replace(local.prefix, ".", "-"), "@", "-"), ",", "-"))
}


resource "aws_db_subnet_group" "db-subnet" {
  name       = "${local.sanitized_name_prefix}-db-subnet"
  subnet_ids = [aws_subnet.public_subnet.id, aws_subnet.public_subnet_2.id]
}

# Update aws_rds_cluster_instance to aws_db_instance to use free tier rds
# db.t3.micro is supported as part of free tier rds
resource "aws_db_instance" "rds_instance" {
  identifier              = "${var.owner}-aqi-rds-instance"
  instance_class          = "db.t3.micro"  # Free tier instance type
  engine                  = "mysql"
  engine_version          = "8.0"          # Ensure version is compatible with free tier
  username                = var.rds_db_username
  password                = var.rds_db_password
  db_name                 = var.rds_db_name
  db_subnet_group_name    = aws_db_subnet_group.db-subnet.name
  vpc_security_group_ids  = [aws_security_group.instance_sg.id]
  allocated_storage       = 20             # Free tier allows 20 GB General Purpose SSD
  skip_final_snapshot     = true
  storage_encrypted       = false
  backup_retention_period = 2
  publicly_accessible = true

  tags = {
    Name = "${local.sanitized_name_prefix}-aqi-rds-instance"
  }
}
