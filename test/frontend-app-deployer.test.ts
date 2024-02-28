/**
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FRONTEND_APP_URL } from '../src/common/constant';
import { CloudFrontFrontendAppStack } from '../src/frontend-app-stack';

describe('CloudFrontFrontendAppStack', () => {
  const commonApp = new App();
  const commonPortalStack = new CloudFrontFrontendAppStack(commonApp, 'frontend-app-stack', {
    targetToCNRegions: false,
    buildScript: 'export APP_PATH=/tmp/app && export NODE_OPTIONS=--openssl-legacy-provider && mkdir $APP_PATH && cd ./frontend/ && find -L . -type f -not -path "./build/*" -not -path "./node_modules/*" \
      -exec cp --parents {} $APP_PATH \\; && cd $APP_PATH && yarn install --loglevel error && yarn run build --loglevel error && cp -r ./build/* /asset-output/',
    baseImageForBuilding: 'public.ecr.aws/docker/library/node:18',
    useCustomDomainName: false,
    domainName: '',
    iamCertificateId: '',
    assetPath: __dirname,
  });
  const commonTemplate = Template.fromStack(commonPortalStack);

  test('Global region', () => {
    commonTemplate.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1);
    commonTemplate.resourceCountIs('AWS::CloudFront::Distribution', 1);
    commonTemplate.resourceCountIs('Custom::CDKBucketDeployment', 1);

    commonTemplate.hasOutput(FRONTEND_APP_URL, {});
  });
});