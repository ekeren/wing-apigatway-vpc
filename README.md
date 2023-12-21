# VPC Endpoint for API Gatwaty 

Related to https://github.com/winglang/wing/issues/5057

This repo is an example on how you can use [custom-platforms]([url](https://www.winglang.io/docs/concepts/platforms#custom-platforms)https://www.winglang.io/docs/concepts/platforms#custom-platforms)
in order to put your api gateway and all lambda function inside the VPC

### How to use it 

1. Create a wing application, that contains `cloud.Api` and `cloud.Function` (e.g. [main.w](/main.w))
2. Compile the using [apigw-deploy-in-vpc.js](/apigw-deploy-in-vpc.js)
```sh
wing compile -t tf-aws -t apigw-deploy-in-vpc.js main.w
```
3. Run terraform apply
```sh
cd target/main.tfaws/
terraform init
terraform apply
```
4. Notice that your API Gateway is private and behind a VPC (same for all your Lambda Functions)

**Notes:**

You should also strongly consider using your terraform backend state inside S3 Backend (see [guide]([url](https://www.winglang.io/docs/guides/terraform-backends)https://www.winglang.io/docs/guides/terraform-backends))

