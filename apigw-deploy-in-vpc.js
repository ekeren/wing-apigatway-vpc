const cdktf = require("cdktf");
const aws_security_group = require("@cdktf/provider-aws/lib/security-group");
const vpc_endpoint = require("@cdktf/provider-aws/lib/vpc-endpoint");
const vpc_endpoint_service = require("@cdktf/provider-aws/lib/data-aws-vpc-endpoint-service");


class TFApiWithVPCAspect {
  constructor(vpcId, privateSubnetId) {
    this.vpcId = vpcId;
    this.privateSubnetId = privateSubnetId;
  }

  visit(node) {
    if (node.terraformResourceType === "aws_api_gateway_rest_api") {
      const scope = node.node.scope;

      const serviceName = new vpc_endpoint_service.DataAwsVpcEndpointService(scope, "VpcEndpointService", {
        service: "execute-api"
      });

      const securityGroup = new aws_security_group.SecurityGroup(scope, "SecurityGroup", {
        vpcId: this.vpcId,
        ingress: [
          { 
            cidrBlocks: ["0.0.0.0/0"],
            fromPort: 0,
            toPort: 0,
            protocol: "-1"
          }
        ]
      });

      const vpcEndpoint = new vpc_endpoint.VpcEndpoint(scope, "VpcEndpoint", {
        vpcId: this.vpcId,
        serviceName: serviceName.serviceName,
        vpcEndpointType: "Interface",
        privateDnsEnabled: true,
        subnetIds: [this.privateSubnetId],
        securityGroupIds: [securityGroup.id]
      });
      
      // API Gateway
      const api = node;

      api.endpointConfiguration.types = ["PRIVATE"];
      api.endpointConfiguration.vpcEndpointIds = [vpcEndpoint.id];

      api.policy = JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: "execute-api:Invoke",
            Resource: ["*"],
          },
          {
            Effect: "Deny",
            Principal: "*",
            Action: "execute-api:Invoke",
            Resource: ["*"],
            Condition: {
              StringNotEquals: {
                "aws:SourceVpce": vpcEndpoint.id,
              },
            },
          },
        ],
      });
    }
  }
}

exports.Platform = class TFApiWithVPC {
  target = "tf-aws";
  preSynth(app) {
    const findLambda = (root) => {
      let a = [];
      for (const c of root.node.children) {
        if (c.constructor.name === "Function") {
          a.push(c);
        }
        a.push(...findLambda(c));
      }
      return a;
    };

    const vpcId = app.vpc.id;
    const privateSubnetId = app.subnets.private.id;

    for (const lambda of findLambda(app)) {
      const securityGroup = new aws_security_group.SecurityGroup(lambda, "SecurityGroup", { 
        vpcId,
        egress: [
          { 
            cidrBlocks: ["0.0.0.0/0"],
            fromPort: 0,
            toPort: 0,
            protocol: "-1"
          }
        ]
      });
      lambda.addNetworkConfig({
        securityGroupIds: [securityGroup.id],
        subnetIds: [privateSubnetId]
      });
    }

    cdktf.Aspects.of(app).add(new TFApiWithVPCAspect(vpcId, privateSubnetId));
  }
};
