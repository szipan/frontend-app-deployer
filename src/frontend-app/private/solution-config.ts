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


export const FRONTEND_CONFIG_PATH = '/aws-exports.json';

export interface FrontendConfigProps {
  readonly frontendVersion: string;
  readonly frontendBucket: string;
  readonly frontendPluginPrefix: string;
  readonly frontendRegion: string;
}

export function generateFrontendConfig(props: FrontendConfigProps) {
  return {
    frontend_version: props.frontendVersion,
    frontend_data_bucket: props.frontendBucket,
    frontend_plugin_prefix: props.frontendPluginPrefix,
    frontend_region: props.frontendRegion,
  };
}