# Private Amazon API Gateway Wing Plugin


This repo is an example on how you can use Wing's [platform provider](https://www.winglang.io/docs/concepts/platforms#custom-platforms)
in order to put your Amazon API Gateway created via `cloud.Api` and all the AWS Lambda functions inside a VPC.

See [#5057](https://github.com/winglang/wing/issues/5057)

## Prerequisites

This requires Wing v0.53.8 or above.

## How to use it?

1. Create a Wing application, with `cloud.Api`s and `cloud.Function`s (see [main.w](/main.w) as an example).
2. Copy [apigateway-vpc.js](/apigateway-vpc.js) to your local machine.
3. Compile with this plugin:
  ```sh
  wing compile -t tf-aws -p ./apigateway-vpc.js main.w
  ```
3. Run terraform apply:
  ```sh
  cd target/main.tfaws/
  terraform init
  terraform apply
  ```
4. This will turn your API Gateway to use a private endpoint and put it behind a VPC, as well as all the serverless functions.

## Notes

You should also strongly consider using your terraform backend state inside S3 Backend (see [guide]([url](https://www.winglang.io/docs/guides/terraform-backends)https://www.winglang.io/docs/guides/terraform-backends))

