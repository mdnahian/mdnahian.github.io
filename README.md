# Pre-requisites

The following are required before installation:

| Name      | Version | 
| ----------- | ----------- | 
| aws-cli      | 2.1.8       |   
| terraform   | 0.14.2         |  
| python      |      3.8.5   |

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

# Misc Commands

### Image Annotations

Run the following command to watermark images:

```bash
convert <image> -gravity center -stroke '#000C' -strokewidth 2 -annotate 0 '@mdni007' -stroke  none  -fill white -annotate 0 '@mdni007' ../mdni007.png
```

### Run Locally

To view the website locally, simply run the following command:

```bash
python3 web/rest/app.py
```

# Uninstallation

```bash
terraform destroy
```