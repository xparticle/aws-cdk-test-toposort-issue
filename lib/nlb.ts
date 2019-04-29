//Add VPC
import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import nlb = require('@aws-cdk/aws-elasticloadbalancingv2');
import { NetworkLoadBalancerImportProps } from '@aws-cdk/aws-elasticloadbalancingv2';

interface NLBStackProps {
    vpcRefProps: ec2.VpcNetworkImportProps;
}

class NLBStack extends cdk.Stack {
    public readonly listener1: nlb.NetworkListener;
    public readonly listener2: nlb.NetworkListener;
    public readonly listener3: nlb.NetworkListener;
    public readonly nlbRefProps: NetworkLoadBalancerImportProps;
    constructor(parent: cdk.App, name: string, props: NLBStackProps) {
        super(parent, name);

        const vpc = ec2.VpcNetwork.import(this, "ParentVPC", props.vpcRefProps);

        //Add NLB

        const lb = new nlb.NetworkLoadBalancer(this, 'LB', {
            vpc,
            internetFacing: false
        });

        //Add Listener#1

        const api1_listener = lb.addListener('api1_listener', {
            port: 2000
        });

        const api2_listener = lb.addListener('api2_listener', {
            port: 3000,

        });

        const api3_listener = lb.addListener('api3_listener', {
            port: 4000,

        });


        
        this.listener1= api1_listener;
        this.listener2= api2_listener;
        this.listener3= api3_listener;

        this.nlbRefProps=lb.export();
    }
}

export default NLBStack;