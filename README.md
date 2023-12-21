# Wing Plugin - Amazon Private API Gateway

This Wing [platform plugin](https://www.winglang.io/docs/concepts/platforms#custom-platforms) deploys
all API Gateways (`cloud.Api`) and AWS Lambda functions (`cloud.Function`) into a VPC. 

See [#5057](https://github.com/winglang/wing/issues/5057)

## Prerequisites

This requires Wing v0.53.8 or above.

## How to use it?

1. Write a Wing application, with `cloud.Api`s and `cloud.Function`s (see [main.w](/main.w) as an example).
2. Download [apigateway-vpc.js](/apigateway-vpc.js) to your project:
  ```sh
  curl https://raw.githubusercontent.com/ekeren/wing-apigatway-vpc/main/apigateway-vpc.js -o apigateway-vpc.js
  ```
3. Install the AWS provider for CDKTF:
  ```sh
  npm i @cdktf/provider-aws
  ```
5. Compile with this plugin:
  ```sh
  wing compile -t tf-aws -p ./apigateway-vpc.js main.w
  ```
3. Run terraform apply:
  ```sh
  cd target/main.tfaws
  terraform init
  terraform apply
  ```
4. This will turn your API Gateway to use a private endpoint and put it behind a VPC, as well as all the serverless functions.

## Notes

You should also strongly consider using your terraform backend state inside S3 Backend (see [guide]([url](https://www.winglang.io/docs/guides/terraform-backends)https://www.winglang.io/docs/guides/terraform-backends))
