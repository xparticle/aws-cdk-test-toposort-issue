//Add VPC
import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');

interface VPCStackProps {
    cidr: string;

}
class VPCStack extends cdk.Stack {
    public readonly vpcRefProps: ec2.VpcNetworkImportProps;
    public readonly sgApigwVpce: ec2.SecurityGroup;
    public readonly sg_lambda: ec2.SecurityGroup;
    public readonly apigwVpceID: String;
    public readonly apigwVpce_dns_0: String;
    constructor(parent: cdk.App, name: string, props: VPCStackProps) {
        super(parent, name);

        const vpc = new ec2.VpcNetwork(this, 'TheVPC', {
            cidr: props.cidr,
            natGateways: 1,
            vpnGateway: true,
            maxAZs: 1,
            subnetConfiguration: [
                {
                    name: 'Application',
                    cidrMask: 26,
                    subnetType: ec2.SubnetType.Private,
                },
                {
                    name: 'Public',
                    cidrMask: 26,
                    subnetType: ec2.SubnetType.Public,
                }
            ],
        });

        const sg_apigw_vpce = new ec2.SecurityGroup(this, 'SecurityGroupVpceApigw', {
            vpc,
            description: 'Allow ssh access to ec2 instances',
            allowAllOutbound: false   // Can be set to false
        });
        const sg_lambda = new ec2.SecurityGroup(this, 'SecurityGroupLambda', {
            vpc,
            description: 'Lambda Security Group',
            allowAllOutbound: false   // Can be set to false
        });

        const apigw_vpc_endpoint = new ec2.CfnVPCEndpoint(this, 'apigw_vpc_endpoint', {
            serviceName: 'com.amazonaws.us-east-1.execute-api',
            vpcId: vpc.vpcId,
            vpcEndpointType: 'Interface',
            subnetIds:vpc.privateSubnets.map(i=>i.subnetId),
            securityGroupIds: [sg_apigw_vpce.securityGroupId]
        });

        this.vpcRefProps = vpc.export();
        this.sgApigwVpce = sg_apigw_vpce;
        this.sg_lambda= sg_lambda;

        this.apigwVpceID = apigw_vpc_endpoint.vpcEndpointId;
        this.apigwVpce_dns_0 = apigw_vpc_endpoint.vpcEndpointDnsEntries[0]
    }
}

export default VPCStack;