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
  /**
  * Indicate whether to create stack in CN regions
  *
  * @default - false.
  */
  readonly targetToCNRegions?: boolean;

  /**
   * Whether to use custom domain name
   */
  readonly useCustomDomainName?: boolean;

  readonly buildScript: string;

  readonly baseImageForBuilding: string;

  readonly domainName?: string;

  readonly iamCertificateId?: string;

  readonly recordName?: string;

  readonly hostedZoneName?: string;

  readonly hostedZoneId?: string;
}

export class CloudFrontFrontendAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: CloudFrontFrontendAppStackProps) {
    super(scope, id, props);

    new FrontendAppDeployer(this, 'frontend-app', {
      targetToCNRegions: props?.targetToCNRegions,
      buildScript: props?.buildScript ?? '',
      baseImageForBuilding: props?.baseImageForBuilding ?? '',
      useCustomDomainName: props?.useCustomDomainName,
      domainName: props?.domainName,
      iamCertificateId: props?.iamCertificateId,
      recordName: props?.recordName,
      hostedZoneName: props?.hostedZoneName,
      hostedZoneId: props?.hostedZoneId,
    });
  }
}

