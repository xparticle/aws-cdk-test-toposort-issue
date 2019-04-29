import cdk = require('@aws-cdk/cdk');
import lambda = require('@aws-cdk/aws-lambda');
import ec2 = require('@aws-cdk/aws-ec2');
import apigateway = require('@aws-cdk/aws-apigateway');
var fs = require("fs");

interface LambdaStackProps {
    vpcRefProps: ec2.VpcNetworkImportProps;
    apigwRefProps: apigateway.RestApiImportProps;
    apigwVpceID: String;
    apigwVpce_dns_0: String
    sgLambda: ec2.SecurityGroup;
}

class LambdaStack extends cdk.Stack {
    public readonly lambdaRefProps: lambda.FunctionImportProps;
    constructor(parent: cdk.App, name: string, props: LambdaStackProps) {
        super(parent, name);

        const vpc = ec2.VpcNetwork.import(this, "ParentVPC", props.vpcRefProps);
        const apigw = apigateway.RestApi.import(this, "API1", props.apigwRefProps);
        const apigwVpceID = props.apigwVpce_dns_0;
        const sg_lambda = props.sgLambda
        

        var lambda_code=fs.readFileSync("./lib/lambda-handler/index.js", "utf8");
        



        const fn = new lambda.Function(this, 'call_private_api', {
            runtime: lambda.Runtime.NodeJS810,
            vpc:vpc,
            vpcSubnets:{subnetType:ec2.SubnetType.Private},//vpc.subnetIds({subnetType:ec2.SubnetType.Private}),
            handler: 'index.handler',
            code: lambda.Code.inline(lambda_code),
            environment:{'apiid':apigw.restApiId,'vpceid':apigwVpceID},
            securityGroup:sg_lambda
        });


        this.lambdaRefProps=fn.export();


        
    }

}

export default LambdaStack;