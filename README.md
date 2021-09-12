# picopic-backend-infrastructure

[![build](https://github.com/jmp/picopic-backend-infrastructure/actions/workflows/build.yml/badge.svg)](https://github.com/jmp/picopic-backend-infrastructure/actions/workflows/build.yml)

This project defines the backend infrastructure for Picopic.
The infrastructure is defined as code using [AWS CDK](https://aws.amazon.com/cdk/).

The backend is hosted on AWS and makes use of the following services:

* [Route 53](https://aws.amazon.com/route53/) for the DNS
* [ACM](https://aws.amazon.com/certificate-manager/) for the TLS certificate
* [API Gateway](https://aws.amazon.com/s3/) for the HTTP API

The architecture is based on microservices. Currently, the backend consists of the following services:

* [Image optimization service](https://github.com/jmp/picopic-backend-optimization-service)
