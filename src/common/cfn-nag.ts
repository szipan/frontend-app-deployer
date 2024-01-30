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

import { Aspects, CfnResource, IAspect, Stack } from 'aws-cdk-lib';
import { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { IConstruct } from 'constructs';

/**
 * cfn-nag suppression rule interface
 */
interface CfnNagSuppressRule {
  readonly id: string;
  readonly reason: string;
}

export function addCfnNagSuppressRules(
  resource: CfnResource,
  rules: CfnNagSuppressRule[],
) {
  resource.addMetadata('cfn_nag', {
    rules_to_suppress: rules,
  });
}

export interface CfnNagMetadata {
  readonly rules_to_suppress: CfnNagSuppressRule[];
}

export interface AddCfnNagItem {
  readonly paths_endswith: string[];
  readonly rules_to_suppress: CfnNagSuppressRule[];
}

export function addCfnNagToStack(stack: Stack, cfnNagList: AddCfnNagItem[], typeList?: string[]) {
  Aspects.of(stack).add(new AddCfnNagForCdkPath(cfnNagList, typeList));
}

export function addCfnNagForCustomResourceProvider(stack: Stack, name: string, pattern: string, serviceName?: string,
  extraCfnNagList: AddCfnNagItem[] = []) {
  const cfnNagListForCustomResource: AddCfnNagItem[] = [
    ...(serviceName ? [ruleRolePolicyWithWildcardResources(`${pattern}/framework-onEvent/ServiceRole/DefaultPolicy/Resource`, name, serviceName)] : []),
    ...extraCfnNagList,
  ];
  addCfnNagToStack(stack, cfnNagListForCustomResource);
}

export function addCfnNagForBucketDeployment(stack: Stack, serviceName: string, extraCfnNagList: AddCfnNagItem[] = []) {
  addCfnNagForCfnResource(stack, 'CDK built-in BucketDeployment', 'Custom::CDKBucketDeployment[A-F0-9]+', serviceName, extraCfnNagList);
}

export function addCfnNagForS3AutoDelete(stack: Stack, extraCfnNagList: AddCfnNagItem[] = []) {

  const cfnNagListForCustomResource: AddCfnNagItem[] = [
    ...extraCfnNagList,
  ];

  addCfnNagToStack(stack, cfnNagListForCustomResource);
}

export function addCfnNagForCertificateRequest(stack: Stack, extraCfnNagList: AddCfnNagItem[] = []) {
  addCfnNagForCfnResource(stack, 'CDK built-in ACMCertificateRequestor', 'CertificateRequestorFunction', 'acm/rout53', extraCfnNagList);
}

export function addCfnNagForLogRetention(stack: Stack, extraCfnNagList: AddCfnNagItem[] = []) {
  addCfnNagForCfnResource(stack, 'CDK built-in LogRetention', 'LogRetention[a-f0-9]+', 'logs', extraCfnNagList);
}

export function addCfnNagForCfnResource(stack: Stack, name: string, pattern: string, serviceName?: string,
  extraCfnNagList: AddCfnNagItem[] = [], typeList?: string[]) {
  const cfnNagListForLogRetention: AddCfnNagItem[] = [
    ...(serviceName ? [ruleRolePolicyWithWildcardResources(`${pattern}/ServiceRole/DefaultPolicy/Resource`, name, serviceName)] : []),
    ...extraCfnNagList,
  ];
  addCfnNagToStack(stack, cfnNagListForLogRetention, typeList);
}

export function ruleRolePolicyWithWildcardResources(pattern: string, name: string, serviceName: string): AddCfnNagItem {
  return {
    paths_endswith: [pattern],
    rules_to_suppress: [
      {
        id: 'W12',
        reason: `Policy is generated by ${name}, * ${serviceName} resources for read only access or IAM limition.`,
      },
    ],
  };
}

class AddCfnNagForCdkPath implements IAspect {
  cfnNagList: AddCfnNagItem[];
  typeList: string[] | undefined;

  constructor(cfnNagList: AddCfnNagItem[], typeList?: string[]) {
    this.cfnNagList = cfnNagList;
    this.typeList = typeList;
  }
  visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      for (const nagConfig of this.cfnNagList) {
        for (const path of nagConfig.paths_endswith) {
          if (
            (
              node.node.path.endsWith(path) ||
              node.node.path.match(new RegExp(path + '$'))
            ) &&
            (
              this.typeList === undefined
              || this.typeList.includes(node.cfnResourceType)
            )
          ) {
            (node as CfnResource).addMetadata('cfn_nag', {
              rules_to_suppress: nagConfig.rules_to_suppress,
            });
          }
        }
      }
    }
  }
}


export function addCfnNagToSecurityGroup(securityGroup: ISecurityGroup, wIds: string[] = ['W40', 'W5']) {

  const wIdsAllForSecurityGroup = [
    {
      id: 'W29',
      reason: 'Disallow all egress traffic',
    },
    {
      id: 'W27',
      reason: 'Allow all traffic from application load balancer',
    },

    {
      id: 'W40',
      reason: 'Design intent: Security Groups egress with an IpProtocol of -1',
    },
    {
      id: 'W5',
      reason: 'Design intent: Security Groups found with cidr open to world on egress',
    },
  ];
  addCfnNagSuppressRules(securityGroup.node.defaultChild as CfnResource, wIdsAllForSecurityGroup.filter(it => wIds.includes(it.id)));
}


export const commonCdkNagRules = [
  {
    id: 'AwsSolutions-L1',
    reason:
      'Need support AWS China regions, the latest NodeJs version in China regions is 16, and latest version in global regions is 18',
  },
];