# Wing Plugin - Amazon Private API Gateway

This Wing [platform plugin](https://www.winglang.io/docs/concepts/platforms#custom-platforms) deploys
all API Gateways (`cloud.Api`) and AWS Lambda functions (`cloud.Function`) into a VPC. 

See [#5057](https://github.com/winglang/wing/issues/5057)

## Prerequisites

This requires Wing v0.53.8 or above.

## How to use it?

1. Let's say you have a Wing with a `cloud.Api`, `cloud.Function` and other awesome things (see [main.w](/main.w) as an example).
2. Install the AWS CDKTF Provider:
  ```sh
  npm i @cdktf/provider-aws
  ```
2. Download [apigateway-vpc.js](/apigateway-vpc.js) to your project:
  ```sh
  curl https://raw.githubusercontent.com/ekeren/wing-apigatway-vpc/main/apigateway-vpc.js -o apigateway-vpc.js
  ```
3. Compile with this plugin:
  ```sh
  wing compile -t tf-aws -p ./apigateway-vpc.js main.w
  ```
4. Run terraform apply:
  ```sh
  cd target/main.tfaws
  terraform init
  terraform apply
  ```

## Let's test!

At the end of your `terraform apply`, you should see something like this:

```
my-gateway-behind-vpc_Endpoint_Url_E71A5235 = "https://cxv1weg8ei.execute-api.us-east-1.amazonaws.com/prod"
```

This is the URL of the `cloud.Api` that you defined.

Let's check that indeed our endpoint cannot be accessed from the public internet:

```sh
curl https://cxv1weg8ei.execute-api.us-east-1.amazonaws.com/prod/dogs
curl: (6) Could not resolve host: cxv1weg8ei.execute-api.us-east-1.amazonaws.com
```

Now, let's run our function, which tries to access the API from within the VPC (all functions are automatically added to the VPC).

```sh
aws lambda invoke --function-name consumer-c8b7be45 out.json
cat out.json
"woof"
```

## Notes

You should also strongly consider using your terraform backend state inside S3 Backend (see [guide]([url](https://www.winglang.io/docs/guides/terraform-backends)https://www.winglang.io/docs/guides/terraform-backends))
