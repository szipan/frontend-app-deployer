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

/**
 * check mapping from doc https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-access-logs.html#attach-bucket-policy
 */

// regex patterns
export const SUBNETS_PATTERN = 'subnet-[a-f0-9]+,(subnet-[a-f0-9]+,?)+';
export const SECURITY_GROUP_PATTERN = 'sg-[a-f0-9]+';
export const MULTI_SECURITY_GROUP_PATTERN = `${SECURITY_GROUP_PATTERN}(,${SECURITY_GROUP_PATTERN})*`;
export const DOMAIN_NAME_PATTERN =
  '[a-z0-9A-Z#$&@_%~\\*\\.\\-]+\\.[a-zA-Z]{2,63}';
export const IP_PATTERN =
  '((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}';
export const HOST_ZONE_ID_PATTERN = '^Z[A-Z0-9]+$';
export const RECORD_NAME_PATTERN = '^[a-zA-Z0-9\\-_]{1,63}$';
export const VPC_ID_PATTERN = '^vpc-[a-f0-9]+$';
export const IAM_CERTIFICATE_ID_PATTERN = '^[A-Z0-9]+$';
export const S3_BUCKET_NAME_PATTERN = '[a-z0-9\\.\\-]{3,63}';
export const S3_PREFIX_PATTERN = '^(|[^/].*/)$';
export const EMAIL_PATTERN =
  '\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*';
export const MULTI_EMAIL_PATTERN = `${EMAIL_PATTERN}(,${EMAIL_PATTERN})*`;
export const POSITIVE_INTEGERS = '^[1-9]\\d*';
export const S3_PATH_PLUGIN_JARS_PATTERN = `^(s3://${S3_BUCKET_NAME_PATTERN}/[^,]+.jar,?){0,}$`;
export const S3_PATH_PLUGIN_FILES_PATTERN = `^(s3://${S3_BUCKET_NAME_PATTERN}/[^,]+,?){0,}$`;
export const SUBNETS_THREE_AZ_PATTERN =
  'subnet-[a-f0-9]+,(subnet-[a-f0-9]+,?){2,}';
export const SECRETS_MANAGER_ARN_PATTERN =
  '^$|^arn:aws(-cn|-us-gov)?:secretsmanager:[a-z0-9-]+:[0-9]{12}:secret:[a-zA-Z0-9-\/]+$';

export const CORS_ORIGIN_DOMAIN_PATTERN = '(?:\\*\\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\\.?';
export const CORS_ORIGIN = `(https?:\\/\\/){1}(localhost|${IP_PATTERN}|${CORS_ORIGIN_DOMAIN_PATTERN})(:[0-9]{2,5})?`;
export const CORS_PATTERN = `^$|^\\*$|^(${CORS_ORIGIN}(,\\s*${CORS_ORIGIN})*)$`;

export const STACK_CORS_ORIGIN_DOMAIN_PATTERN = '(?:\\.\\*\\\\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\\.?';
export const STACK_CORS_ORIGIN = `(https?:\\/\\/){1}(localhost|${IP_PATTERN}|${STACK_CORS_ORIGIN_DOMAIN_PATTERN})(:[0-9]{2,5})?`;
export const STACK_CORS_PATTERN = `^$|^(\\.\\*)$|^(${STACK_CORS_ORIGIN}(\\|${STACK_CORS_ORIGIN})*)$`;

export const XSS_PATTERN = '<(?:"[^"]*"[\'"]*|\'[^\']*\'[\'"]*|[^\'">])+(?<!/\s*)>';
export const REGION_PATTERN = '[a-z]{2}-[a-z0-9]{1,10}-[0-9]{1}';

// cloudformation parameters
export const PARAMETER_GROUP_LABEL_VPC = 'VPC Information';
export const PARAMETER_GROUP_LABEL_DOMAIN = 'Domain Information';
export const PARAMETER_GROUP_LABEL_OIDC = 'OpenID Connector Information';
export const PARAMETER_LABEL_VPCID = 'VPC ID';
export const PARAMETER_LABEL_PUBLIC_SUBNETS = 'Public Subnet IDs';
export const PARAMETER_LABEL_PRIVATE_SUBNETS = 'Private Subnet IDs';
export const PARAMETER_LABEL_HOST_ZONE_ID = 'Host Zone ID';
export const PARAMETER_LABEL_HOST_ZONE_NAME = 'Host Zone Name';
export const PARAMETER_LABEL_RECORD_NAME = 'Record Name';
export const PARAMETER_LABEL_DOMAIN_NAME = 'Domain Name';
export const PARAMETER_LABEL_CERTIFICATE_ARN = 'Certificate ARN';

// the outputs of stacks
export const OUTPUT_CONTROL_PLANE_URL = 'FrontendAppURL';
export const OUTPUT_CONTROL_PLANE_BUCKET = 'FrontendAppBucket';
