const cdktf = require("cdktf");
const aws_security_group = require("@cdktf/provider-aws/lib/security-group");
const vpc_endpoint = require("@cdktf/provider-aws/lib/vpc-endpoint");
const vpc_endpoint_service = require("@cdktf/provider-aws/lib/data-aws-vpc-endpoint-service");

class TFLambdaWithVPCAspect { 
  constructor(vpcId, privateSubnetId) {
    this.vpcId = vpcId;
    this.privateSubnetId = privateSubnetId;
  }

  visit(node) {
    if (node.constructor.name !== "Function") {
        return;
    }
    const securityGroup = new aws_security_group.SecurityGroup(node, "SecurityGroup", { 
      vpcId: this.vpcId,
      egress: [
        { 
          cidrBlocks: ["0.0.0.0/0"],
          fromPort: 0,
          toPort: 0,
          protocol: "-1"
        }
      ]
    });
    node.addNetworkConfig({
      securityGroupIds: [securityGroup.id],
      subnetIds: [this.privateSubnetId]
    });
  }
}

class TFApiWithVPCAspect {
  constructor(vpcId, privateSubnetId) {
    this.vpcId = vpcId;
    this.privateSubnetId = privateSubnetId;
  }

  visit(node) {
    if (node.terraformResourceType !== "aws_api_gateway_rest_api") {
      return
    }
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

exports.Platform = class TFApiWithVPC {
  target = "tf-aws";
  preSynth(app) {
    cdktf.Aspects.of(app).add(new TFApiWithVPCAspect(app.vpc.id, app.subnets.private.id));
    cdktf.Aspects.of(app).add(new TFLambdaWithVPCAspect(app.vpc.id, app.subnets.private.id));
  }
};
