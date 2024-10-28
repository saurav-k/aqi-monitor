provider "aws" {
  region = "us-west-2"
}

# Create VPC
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "main_vpc"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id
  tags = {
    Name = "main_igw"
  }
}

# Create Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  tags = {
    Name = "public_subnet"
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
    Name = "public_rt"
  }
}

# Associate Route Table with Subnet
resource "aws_route_table_association" "public_rt_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# Security Group for allowing SSH, HTTP, and Postgres access
resource "aws_security_group" "instance_sg" {
  vpc_id = aws_vpc.main_vpc.id
  ingress {
    from_port   = 22
    to_port     = 22
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
    Name = "instance_sg"
  }
}

# EC2 Instance for DB (Postgres)
resource "aws_instance" "db_instance" {
  ami           = "ami-12345678"  # Replace with a suitable AMI ID
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.instance_sg.name]
  key_name      = "your-key-pair" # Replace with your key pair

  # Attach Elastic IP
  associate_public_ip_address = true

  tags = {
    Name = "db_instance"
  }
}

resource "aws_eip" "db_instance_eip" {
  instance = aws_instance.db_instance.id
}

# EC2 Instance for UI/API
resource "aws_instance" "ui_api_instance" {
  ami           = "ami-12345678"  # Replace with a suitable AMI ID
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.instance_sg.name]
  key_name      = "your-key-pair" # Replace with your key pair

  # Attach Elastic IP
  associate_public_ip_address = true

  tags = {
    Name = "ui_api_instance"
  }
}

resource "aws_eip" "ui_api_instance_eip" {
  instance = aws_instance.ui_api_instance.id
}
