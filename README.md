# Pre-requisites

The following are required before installation:

| Name      | Version | 
| ----------- | ----------- | 
| aws-cli      | 2.1.8       |   
| terraform   | 0.14.2         |  

Configure AWS CLI before proceeding:

```bash
aws configure
```

# Installation

```bash
terraform apply
```

This will create the following on AWS:

* Elastic IP
* EC2 Instance with user data
* EBS volume
* Security Groups

# Uninstallation

```bash
terraform destroy
```