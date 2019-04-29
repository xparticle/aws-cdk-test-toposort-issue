import cdk = require('@aws-cdk/cdk');
import ec2 = require('@aws-cdk/aws-ec2');
import autoscaling = require('@aws-cdk/aws-autoscaling');


interface EC2StackProps {
    vpcRefProps: ec2.VpcNetworkImportProps;

}

class EC2Stack extends cdk.Stack {
    public readonly myasg: autoscaling.AutoScalingGroup;
    public readonly mysg: ec2.SecurityGroup;
    constructor(parent: cdk.App, name: string, props: EC2StackProps) {
        super(parent, name);

        const vpc = ec2.VpcNetwork.import(this, "ParentVPC", props.vpcRefProps);

        const mySecurityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow ssh access to ec2 instances',
            allowAllOutbound: true   // Can be set to false
          });
          mySecurityGroup.addIngressRule(new ec2.AnyIPv4(), new ec2.TcpPort(80), 'allow ssh access from the world');


        const linux = new ec2.GenericLinuxImage({
            'us-east-1': 'ami-0de53d8956e8dcf80'            
        });
        
        
        var myasg = new autoscaling.AutoScalingGroup(this, 'ASG', {
            vpc,
            instanceType: new ec2.InstanceTypePair(ec2.InstanceClass.Burstable2, ec2.InstanceSize.Micro),
            machineImage: linux,
            desiredCapacity:1,
            maxCapacity:1,
            minCapacity:1
        });

        myasg.addSecurityGroup(mySecurityGroup);
        myasg.addUserData(
            "curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash",
            ". /.nvm/nvm.sh",
            "export NVM_DIR='/.nvm'",
            "nvm install node",
            "yum -y install git",
            "cd /home/ec2-user",
            "git clone https://github.com/xparticle/nodejs_hello_world.git hello_world",
            "cd hello_world",
            "npm start")


        this.myasg=myasg;
        this.mysg=mySecurityGroup


        
    }

}

export default EC2Stack;