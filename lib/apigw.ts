#!/usr/bin/env node

import cdk = require('@aws-cdk/cdk');
import apigateway = require('@aws-cdk/aws-apigateway');
import { VpcLink, ConnectionType } from '@aws-cdk/aws-apigateway';
import nlb = require('@aws-cdk/aws-elasticloadbalancingv2');
import { HttpIntegration } from '@aws-cdk/aws-apigateway';
import {  PolicyStatement, PolicyDocument } from '@aws-cdk/aws-iam';

interface ApigwStackProps {
    nlbRefProps: nlb.NetworkLoadBalancerImportProps;
    vpceid: String
}

class ApigwStack extends cdk.Stack {
    public readonly apigwRefProps: apigateway.RestApiImportProps;
    constructor(parent: cdk.App, name: string, props: ApigwStackProps) {
        super(parent, name);

        const nlb1 = nlb.NetworkLoadBalancer.import(this, "ParentVPC", props.nlbRefProps);

        const vpclinkl1 = new VpcLink(this,'vpclink1',{

            name:'testthisone',
            targets: [nlb1],
            description:'may be this'
            
        });

        const httpint1= new HttpIntegration('http://localhost.com:2000/',{
            httpMethod:'GET',
            options:{
                connectionType:ConnectionType.VpcLink,
                vpcLink:vpclinkl1
            },
            proxy:true

        });

        const httpint2= new HttpIntegration('http://localhost.com:3000/',{
            httpMethod:'GET',
            options:{
                connectionType:ConnectionType.VpcLink,
                vpcLink:vpclinkl1
            },
            proxy:true

        });

        const httpint3= new HttpIntegration('http://localhost.com:4000/',{
            httpMethod:'GET',
            options:{
                connectionType:ConnectionType.VpcLink,
                vpcLink:vpclinkl1
            },
            proxy:true

        });

        //Build api resource policy

        const apipolicy = new PolicyDocument();

        

        const statement1= new PolicyStatement();

        statement1.deny()
        statement1.addAction("execute-api:Invoke")
        statement1.addResource("execute-api:/*")
        statement1.addCondition("StringNotEquals",{"aws:SourceVpce":props.vpceid})
        statement1.addAnyPrincipal()

        const statement2= new PolicyStatement();

        statement2.allow()
        statement2.addAction("execute-api:Invoke")
        statement2.addResource("execute-api:/*")
        statement2.addAnyPrincipal()

        apipolicy.addStatement(statement1)
        apipolicy.addStatement(statement2)
        //Build three API Gateway resources

        //console.log(apipolicy.toJSON);

        const api = new apigateway.RestApi(this, 'api', {
            endpointTypes: [apigateway.EndpointType.Private],
            policy: apipolicy
            
        });
        api.root.addMethod('ANY');

        const api1 = api.root.addResource('api1');
        api1.addProxy({
            defaultIntegration: httpint1,
            defaultMethodOptions:{
                authorizationType:apigateway.AuthorizationType.None
            }
          });

        const api2 = api.root.addResource('api2');
        api2.addProxy({
            defaultIntegration: httpint2
          });

        const api3 = api.root.addResource('api3');
        api3.addProxy({
            defaultIntegration: httpint3
          });



        api.latestDeployment

          

        this.apigwRefProps = api.export();



    }
}

export default ApigwStack;
