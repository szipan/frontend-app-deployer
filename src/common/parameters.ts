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

import {
  CfnParameter, CfnRule, Fn,
} from 'aws-cdk-lib';

import { IBucket } from 'aws-cdk-lib/aws-s3';

import { Construct, IConstruct } from 'constructs';
import {
  DOMAIN_NAME_PATTERN,
  HOST_ZONE_ID_PATTERN,
  PARAMETER_GROUP_LABEL_DOMAIN,
  PARAMETER_GROUP_LABEL_VPC,
  PARAMETER_LABEL_HOST_ZONE_ID,
  PARAMETER_LABEL_HOST_ZONE_NAME,
  PARAMETER_LABEL_PRIVATE_SUBNETS,
  PARAMETER_LABEL_PUBLIC_SUBNETS,
  PARAMETER_LABEL_RECORD_NAME,
  PARAMETER_LABEL_VPCID,
  RECORD_NAME_PATTERN,
  SUBNETS_PATTERN,
  VPC_ID_PATTERN,
  IAM_CERTIFICATE_ID_PATTERN,
  S3_BUCKET_NAME_PATTERN,
  S3_PREFIX_PATTERN,
} from './constant';

export interface LogProps {
  readonly enableAccessLog: boolean;
  readonly bucket?: IBucket;
  readonly prefix?: string;
}

export enum SubnetParameterType {
  'List',
  'String'
}

interface ParameterProps {
  type?: string;
  description?: string;
  minLength?: number;
  default?: string;
  allowedPattern?: string;
  constraintDescription?: string;
}

export interface NetworkParameters {
  vpcId: CfnParameter;
  publicSubnets?: CfnParameter;
  privateSubnets: CfnParameter;
  paramLabels: any[];
  paramGroups: any[];
}

export interface DomainParameters {
  hostedZoneId: CfnParameter;
  hostedZoneName: CfnParameter;
  recordName: CfnParameter;
  paramLabels: any[];
  paramGroups: any[];
}

export class Parameters {

  public static createHostedZoneIdParameter(scope: Construct, id?: string): CfnParameter {
    return new CfnParameter(scope, id ?? 'HostedZoneId', {
      description: 'The hosted zone ID in Route 53.',
      type: 'AWS::Route53::HostedZone::Id',
      allowedPattern: `${HOST_ZONE_ID_PATTERN}`,
      constraintDescription: `Host zone id must match pattern ${HOST_ZONE_ID_PATTERN}`,
    });
  }

  public static createHostedZoneNameParameter(scope: Construct, id?: string): CfnParameter {
    return new CfnParameter(scope, id ?? 'HostedZoneName', {
      description: 'The hosted zone name in Route 53',
      type: 'String',
      allowedPattern: `^${DOMAIN_NAME_PATTERN}$`,
      constraintDescription: `Host zone name must match pattern ${DOMAIN_NAME_PATTERN}`,
    });
  }

  public static createDomainNameParameter(scope: Construct, id?: string): CfnParameter {
    return new CfnParameter(scope, id ?? 'DomainName', {
      description: 'The custom domain name.',
      type: 'String',
      allowedPattern: `^${DOMAIN_NAME_PATTERN}$`,
      constraintDescription: `Domain name must match pattern ${DOMAIN_NAME_PATTERN}`,
    });
  }

  public static createIAMCertificateIdParameter(scope: Construct, id?: string): CfnParameter {
    return new CfnParameter(scope, id ?? 'IAMCertificateId', {
      description: 'The IAM certificate id.',
      type: 'String',
      allowedPattern: `^${IAM_CERTIFICATE_ID_PATTERN}$`,
      constraintDescription: `Certifiate id must match pattern ${IAM_CERTIFICATE_ID_PATTERN}`,
    });
  }

  public static createRecordNameParameter(scope: Construct, id?: string): CfnParameter {
    return new CfnParameter(scope, id ?? 'RecordName', {
      description: 'The record name of custom domain.',
      type: 'String',
      allowedPattern: `${RECORD_NAME_PATTERN}`,
      constraintDescription: `Record name must match pattern ${RECORD_NAME_PATTERN}`,
    });
  }

  public static createVpcIdParameter(scope: Construct, id?: string, props: ParameterProps = {}): CfnParameter {
    const allowedPattern = props.allowedPattern ?? `^${VPC_ID_PATTERN}$`;
    return new CfnParameter(scope, id ?? 'VpcId', {
      description: 'Select the virtual private cloud (VPC).',
      type: 'AWS::EC2::VPC::Id',
      allowedPattern: allowedPattern,
      constraintDescription: `VPC id must match pattern ${allowedPattern}`,
      ...props,
    });
  }

  public static createPublicSubnetParameter(scope: Construct, id?: string, type: SubnetParameterType = SubnetParameterType.List): CfnParameter {

    if (type === SubnetParameterType.List) {
      return new CfnParameter(scope, id ?? 'PublicSubnets', {
        description: 'Select at least one public subnet in each Availability Zone.',
        type: 'List<AWS::EC2::Subnet::Id>',
      });
    } else {
      return new CfnParameter(scope, 'PublicSubnetIds', {
        description: 'Comma delimited public subnet ids.',
        type: 'String',
        allowedPattern: `^${SUBNETS_PATTERN}$`,
        constraintDescription: `Public subnet ids must have at least 2 subnets and match pattern ${SUBNETS_PATTERN}`,
      });
    }
  }

  public static createPrivateSubnetParameter(scope: Construct, id?: string,
    type: SubnetParameterType = SubnetParameterType.List, props: ParameterProps = {}): CfnParameter {
    if (type === SubnetParameterType.List) {
      return new CfnParameter(scope, id ?? 'PrivateSubnets', {
        description: 'Select at least one private subnet in each Availability Zone.',
        type: 'List<AWS::EC2::Subnet::Id>',
        ...props,
      });
    } else {
      const allowedPattern = props.allowedPattern ?? `^${SUBNETS_PATTERN}$`;
      return new CfnParameter(scope, id ?? 'PrivateSubnetIds', {
        description: 'Comma delimited private subnet ids.',
        type: 'String',
        constraintDescription: `Private subnet ids must have at least 2 subnets and match pattern ${allowedPattern}`,
        ...props,
        allowedPattern: allowedPattern,
      });
    }
  }

  public static createS3BucketParameter(scope: Construct, id: string,
    props: { description: string; allowedPattern?: string; default?: string }): CfnParameter {
    return new CfnParameter(scope, id, {
      type: 'String',
      allowedPattern: `^(${S3_BUCKET_NAME_PATTERN})?$`,
      ...props,
    });
  }

  public static createS3PrefixParameter(scope: Construct, id: string,
    props: { description: string; default: string; allowedPattern?: string }): CfnParameter {
    const pattern = props.allowedPattern ?? S3_PREFIX_PATTERN;
    return new CfnParameter(scope, id, {
      type: 'String',
      allowedPattern: pattern,
      constraintDescription: `${id} must match pattern ${pattern}.`,
      ...props,
    });
  }

  public static createNetworkParameters(
    scope: Construct,
    needPublicSubnets: boolean,
    subnetParameterType?: SubnetParameterType,
    paramGroups?: any[],
    paramLabels?: any,
    customId?: string): NetworkParameters {
    const groups: any[] = paramGroups ?? [];
    const labels: any = paramLabels ?? {};
    const res: any[] = [];

    const vpcId = this.createVpcIdParameter(scope, customId);
    labels[vpcId.logicalId] = {
      default: PARAMETER_LABEL_VPCID,
    };
    res.push(vpcId.logicalId);

    let publicSubnets: CfnParameter | undefined;
    if (needPublicSubnets) {
      publicSubnets = this.createPublicSubnetParameter(scope, customId, subnetParameterType ?? SubnetParameterType.List);
      labels[publicSubnets.logicalId] = {
        default: PARAMETER_LABEL_PUBLIC_SUBNETS,
      };
      res.push(publicSubnets.logicalId);
    }

    const privateSubnets = this.createPrivateSubnetParameter(scope, customId, subnetParameterType ?? SubnetParameterType.List);
    labels[privateSubnets.logicalId] = {
      default: PARAMETER_LABEL_PRIVATE_SUBNETS,
    };
    res.push(privateSubnets.logicalId);

    groups.push({
      Label: { default: PARAMETER_GROUP_LABEL_VPC },
      Parameters: res,
    });

    new CfnRule(scope, 'SubnetsInVpc', {
      assertions: [
        {
          assert: Fn.conditionEachMemberIn(Fn.valueOfAll('AWS::EC2::Subnet::Id', 'VpcId'), Fn.refAll('AWS::EC2::VPC::Id')),
          assertDescription:
            'All subnets must in the VPC',
        },
      ],
    });

    return {
      vpcId,
      publicSubnets,
      privateSubnets,
      paramLabels: labels,
      paramGroups: groups,
    };
  }

  public static createDomainParameters(scope: Construct, paramGroups?: any[], paramLabels?: any, customId?: string): DomainParameters {

    const groups: any[] = paramGroups ?? [];
    const labels: any = paramLabels ?? {};

    const hostedZoneId = this.createHostedZoneIdParameter(scope, customId ?? undefined);
    labels[hostedZoneId.logicalId] = {
      default: PARAMETER_LABEL_HOST_ZONE_ID,
    };

    const hostedZoneName = this.createHostedZoneNameParameter(scope, customId ?? undefined);
    labels[hostedZoneName.logicalId] = {
      default: PARAMETER_LABEL_HOST_ZONE_NAME,
    };


    const recordName = this.createRecordNameParameter(scope, customId ?? undefined);
    labels[recordName.logicalId] = {
      default: PARAMETER_LABEL_RECORD_NAME,
    };

    groups.push({
      Label: { default: PARAMETER_GROUP_LABEL_DOMAIN },
      Parameters: [hostedZoneId.logicalId, hostedZoneName.logicalId, recordName.logicalId],
    });

    return {
      hostedZoneId,
      hostedZoneName,
      recordName: recordName ?? undefined,
      paramLabels: labels,
      paramGroups: groups,
    };
  }

  public static createSecurityGroupIdsParameter(
    scope: IConstruct,
    id: string = 'SecurityGroupIds',
    allowEmpty: boolean = false,
    props: ParameterProps = {},
  ) {
    const singleSGPattern = 'sg-[a-f0-9]+';
    let allowedPattern = `${singleSGPattern}(,${singleSGPattern})*`;
    if (allowEmpty) {
      allowedPattern = `(${allowedPattern})?`;
    }
    const securityGroupIdParam = new CfnParameter(scope, id, {
      description:
        'Choose security groups',
      type: 'String',
      allowedPattern: `^${allowedPattern}$`,
      constraintDescription: `Security group must match pattern ${allowedPattern}`,
      ...props,
    });

    return securityGroupIdParam;
  }
}

