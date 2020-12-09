terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 2.70"
    }
  }
}

provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "all" {
  vpc_id = data.aws_vpc.default.id
}

module "security_group" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "~> 3.0"

  name        = "website-ec2-sg"
  description = "Security group for website EC2 instance"
  vpc_id      = data.aws_vpc.default.id

  ingress_cidr_blocks = ["0.0.0.0/0"]
  ingress_rules       = ["http-80-tcp", "ssh-tcp"]
  egress_rules        = ["all-all"]
}

resource "aws_eip" "ec2_elastic_ip" {
  vpc      = true
  instance = aws_instance.web.id
}

resource "aws_instance" "web" {
  ami              = "ami-0885b1f6bd170450c"
  instance_type    = "t2.nano"
  subnet_id        = tolist(data.aws_subnet_ids.all.ids)[0]
  key_name         = "aws"
  user_data_base64 = base64encode(file("install-dep.sh"))
  tags = {
    Name = "mdislam.com"
    Type = "website"
  }
  vpc_security_group_ids = [module.security_group.this_security_group_id]
}

output "aws_elastic_ip" {
  value       = aws_eip.ec2_elastic_ip.public_ip
}
