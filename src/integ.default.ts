import * as cdk from 'aws-cdk-lib';
import { CloudFrontFrontendAppStack } from './frontend-app-stack';

const mockApp = new cdk.App();

new CloudFrontFrontendAppStack(mockApp, 'frontend-app-stack', {
});