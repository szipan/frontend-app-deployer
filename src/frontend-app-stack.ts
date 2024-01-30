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

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendAppDeployer } from './index';

export interface CloudFrontFrontendAppStackProps extends StackProps {
}

export class CloudFrontFrontendAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: CloudFrontFrontendAppStackProps) {
    super(scope, id, props);

    const frontendAppDeploy = new FrontendAppDeployer(this, 'frontend-app', {
      buildScript: 'export APP_PATH=/tmp/app && export NODE_OPTIONS=--openssl-legacy-provider && mkdir $APP_PATH && cd ./frontend/ && find -L . -type f -not -path "./build/*" -not -path "./node_modules/*" \
      -exec cp --parents {} $APP_PATH \\; && cd $APP_PATH && yarn install --loglevel error && yarn run build --loglevel error && cp -r ./build/* /asset-output/',
      baseImageForBuilding: 'public.ecr.aws/docker/library/node:18',
    });

    frontendAppDeploy.toString();
  }
}

