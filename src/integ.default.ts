import * as cdk from 'aws-cdk-lib';
import { CloudFrontFrontendAppStack } from './frontend-app-stack';

const mockApp = new cdk.App();

new CloudFrontFrontendAppStack(mockApp, 'frontend-app-stack', {
  targetToCNRegions: false,
  buildScript: 'export APP_PATH=/tmp/app && export NODE_OPTIONS=--openssl-legacy-provider && mkdir $APP_PATH && cd ./frontend/ && find -L . -type f -not -path "./build/*" -not -path "./node_modules/*" \
      -exec cp --parents {} $APP_PATH \\; && cd $APP_PATH && yarn install --loglevel error && yarn run build --loglevel error && cp -r ./build/* /asset-output/',
  baseImageForBuilding: 'public.ecr.aws/docker/library/node:18',
  useCustomDomainName: false,
  domainName: 'clickstream-test.nwcdlab.com',
  iamCertificateId: 'ASCAXBETMEGCQQ3WCVKPB',
  assetPath: __dirname,
});