import cdk = require('@aws-cdk/cdk');
import ec2cdk = require('@aws-cdk/aws-ec2');
import VPCStack from "../lib/vpc";
import NLBStack from "../lib/nlb";
import EC2Stack from "../lib/ec2";
import LambdaStack from "../lib/lambda";
import ApigwStack from "../lib/apigw";

const app = new cdk.App();

const vpc_cidr_ipv4='10.0.0.0/16'

const vpc = new VPCStack(app, 'VPC', {cidr:vpc_cidr_ipv4});

const nlb = new NLBStack(app, 'NLB', { vpcRefProps: vpc.vpcRefProps });

const ec2 = new EC2Stack(app, 'EC2', { vpcRefProps: vpc.vpcRefProps });

const apigw = new ApigwStack(app, 'APIGW', { nlbRefProps: nlb.nlbRefProps, vpceid:vpc.apigwVpceID });


vpc.sg_lambda.addEgressRule(vpc.sgApigwVpce, new ec2cdk.TcpPort(443), 'allow lambda to call apigw vpce', true);
ec2.mysg.addIngressRule(new ec2cdk.CidrIPv4(vpc_cidr_ipv4),new ec2cdk.TcpPort(80), 'allow http access from the vpc CIDR', true);
vpc.sgApigwVpce.addIngressRule(new ec2cdk.CidrIPv4(vpc_cidr_ipv4),new ec2cdk.TcpPort(443), 'allow https access from the vpc CIDR', true);


nlb.listener1.addTargets('Service-1', {
      port: 80,
      targets: [ec2.myasg]
    });
nlb.listener2.addTargets('Service-2', {
      port: 80,
      targets: [ec2.myasg]
    });
nlb.listener3.addTargets('Service-3', {
      port: 80,
      targets: [ec2.myasg]
    });

new LambdaStack(app,'LAMBDA', { 
    vpcRefProps: vpc.vpcRefProps, 
    apigwRefProps:apigw.apigwRefProps,
    apigwVpceID:vpc.apigwVpceID,
    apigwVpce_dns_0:vpc.apigwVpce_dns_0,
    sgLambda:vpc.sg_lambda
})


app.run();