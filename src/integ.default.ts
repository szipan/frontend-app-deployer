import * as cdk from 'aws-cdk-lib';
import { CloudFrontFrontendAppStack } from './frontend-app-stack';

const mockApp = new cdk.App();
//const stack = new cdk.Stack(mockApp, 'testing-stack');

new CloudFrontFrontendAppStack(mockApp, 'frontend-app-stack', {
});