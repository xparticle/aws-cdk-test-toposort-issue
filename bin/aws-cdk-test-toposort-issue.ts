#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/cdk');
import { AwsCdkTestToposortIssueStack } from '../lib/aws-cdk-test-toposort-issue-stack';

const app = new cdk.App();
new AwsCdkTestToposortIssueStack(app, 'AwsCdkTestToposortIssueStack');
