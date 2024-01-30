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
  RemovalPolicy,
  Fn,
  DockerImage,
  BundlingOutput,
  ArnFormat,
  Arn,
  Aws,
  Stack,
  Duration,
  AssetHashType, IResolvable, CfnCondition,
} from 'aws-cdk-lib';
import { ICertificate, DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  IDistribution,
  Distribution,
  CfnOriginAccessControl,
  AllowedMethods,
  CachedMethods,
  ViewerProtocolPolicy,
  PriceClass,
  SecurityPolicyProtocol,
  CfnDistribution,
  CachePolicy,
  OriginAccessIdentity,
  CloudFrontWebDistribution,
  CloudFrontAllowedMethods,
  OriginSslPolicy,
  OriginProtocolPolicy,
  ResponseHeadersPolicy,
  HttpVersion,
} from 'aws-cdk-lib/aws-cloudfront';
import { AddBehaviorOptions } from 'aws-cdk-lib/aws-cloudfront/lib/distribution';
import { FunctionAssociation } from 'aws-cdk-lib/aws-cloudfront/lib/function';
import { HttpOrigin, HttpOriginProps, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { PolicyStatement, Effect, ServicePrincipal, CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam';

import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import {
  BlockPublicAccess,
  IBucket,
  Bucket,
  BucketEncryption,
  BucketAccessControl,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';
import {
  Source,
  BucketDeployment,
} from 'aws-cdk-lib/aws-s3-deployment';

import { Construct } from 'constructs';
import { Constant } from './private/constant';
import { addCfnNagSuppressRules } from '../common/cfn-nag';
import { LogProps } from '../common/parameters';
import { getShortIdOfStack } from '../common/stack';
import { capitalizePropertyNames, isEmpty } from '../common/utils';

export interface DistributionProps {
  readonly enableIpv6?: boolean;
  readonly cachedMethods?: CachedMethods;
  readonly logProps?: LogProps;
  readonly functionAssociations?: FunctionAssociation[];
  readonly responseHeadersPolicy?: ResponseHeadersPolicy;
}

export interface FrontendProps {
  readonly assetPath: string;
  readonly dockerImage: DockerImage;
  readonly buildCommand: string[];
  readonly user?: string;
  readonly autoInvalidFilePaths?: string[];
  readonly assetHash?: string;
  readonly assetHashType?: AssetHashType;
  readonly environment?: {
    [key: string]: string;
  };
}

export interface DomainProps {
  readonly recordName: string;
  readonly hostZone: IHostedZone;
  readonly certificate?: ICertificate;
}

export interface CNFrontendAppPortalProps {
  readonly domainName: string;
  readonly iamCertificateId: string;
}

export interface FrontendAppPortalProps {
  readonly frontendProps: FrontendProps;
  readonly distributionProps?: DistributionProps;
  readonly domainProps?: DomainProps;
  readonly cnFrontendAppPortalProps?: CNFrontendAppPortalProps;
}

export class FrontendAppPortal extends Construct {

  public readonly distribution: IDistribution;
  public readonly portalBucket: IBucket;
  public readonly logBucket: IBucket;
  public readonly frontendAppUrl: string;
  public readonly bucketDeployment: BucketDeployment;
  private origins: Array<CfnDistribution.OriginProperty | IResolvable> | IResolvable;
  private cacheBehaviors: Array<CfnDistribution.CacheBehaviorProperty | IResolvable> | IResolvable;

  constructor(scope: Construct, id: string, props: FrontendAppPortalProps) {
    super(scope, id);
    this.origins = new Array<CfnDistribution.OriginProperty | IResolvable>();
    this.cacheBehaviors = new Array<CfnDistribution.CacheBehaviorProperty | IResolvable>();

    this.node.addValidation({
      validate: () => {
        const messages: string[] = [];
        if (props.cnFrontendAppPortalProps !== undefined && props.domainProps !== undefined) {
          messages.push('DomainProps is unnecessary when cnCloudFrontS3PortalProps is not undefined and vice versa');
        }

        return messages;
      },
    });

    const buckets = this.createBuckets(props.distributionProps?.logProps?.bucket);
    this.logBucket = buckets.logBucket;
    this.portalBucket = buckets.portalBucket;
    const portalBucket = buckets.portalBucket;

    const distributionDescription = `CloudFront distribution for ${Stack.of(this).templateOptions.description}`;

    let portalBucketPolicyStatement: PolicyStatement;
    if (props.cnFrontendAppPortalProps !== undefined) {
      const distribution = this.createDistributionForCNRegions(portalBucket, distributionDescription, props);
      this.distribution = distribution.distribution;
      portalBucketPolicyStatement = distribution.portalBucketPolicyStatement;
      this.frontendAppUrl = 'https://' + props.cnFrontendAppPortalProps.domainName;
    } else {
      const distribution = this.createDistribution(portalBucket, distributionDescription, props);
      this.distribution = distribution.distribution;
      portalBucketPolicyStatement = distribution.portalBucketPolicyStatement;

      if (props.domainProps !== undefined) {
        const record = new ARecord(this, 'PortalRecord', {
          recordName: props.domainProps.recordName,
          zone: props.domainProps.hostZone,
          target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        });

        this.frontendAppUrl = 'https://' + record.domainName;
      } else {
        this.frontendAppUrl = 'https://' + this.distribution.distributionDomainName;
      }
    }

    portalBucket.addToResourcePolicy(portalBucketPolicyStatement);


    // upload static web assets
    this.bucketDeployment = new BucketDeployment(this, 'portal_deploy', {
      sources: process.env.IS_SKIP_ASSET_BUNDLE === 'true' ? [Source.data('test', 'test')] : [
        Source.asset(props.frontendProps.assetPath, {
          bundling: {
            image: props.frontendProps.dockerImage,
            command: props.frontendProps.buildCommand,
            user: props.frontendProps.user,
            outputType: BundlingOutput.NOT_ARCHIVED,
            environment: props.frontendProps.environment,
          },
          assetHash: props.frontendProps.assetHash ?? undefined,
          assetHashType: props.frontendProps.assetHashType ?? AssetHashType.SOURCE,
        }),
      ],
      destinationBucket: portalBucket,
      prune: false,
      distribution: this.distribution,
      distributionPaths: props.frontendProps.autoInvalidFilePaths,
    });
  }

  private createDistribution(portalBucket: IBucket, distDescription: string,
    props: FrontendAppPortalProps): {
      distribution: IDistribution;
      portalBucketPolicyStatement: PolicyStatement;
    } {
    const origin = new S3Origin(portalBucket);
    const portalBucketPolicyStatement = new PolicyStatement({
      actions: ['s3:GetObject'],
      effect: Effect.ALLOW,
      principals: [
        new ServicePrincipal('cloudfront.amazonaws.com'),
      ],
      resources: [`${portalBucket.bucketArn}/*`],
    });

    let certificate: ICertificate | undefined = undefined;
    let domainName: string | undefined = undefined;
    if (props.domainProps != undefined) {
      domainName = Fn.join('.', [props.domainProps.recordName, props.domainProps.hostZone.zoneName]);
      if (props.domainProps?.certificate === undefined) {
        certificate = new DnsValidatedCertificate(this, 'certificate', {
          domainName: Fn.join('.', [props.domainProps.recordName, props.domainProps.hostZone.zoneName]),
          hostedZone: props.domainProps.hostZone,
          region: 'us-east-1',
        });
      } else {
        certificate = props.domainProps.certificate;
      }
    }

    const shortId = getShortIdOfStack(Stack.of(this));
    const oac = new CfnOriginAccessControl(this, 'origin_access_control', {
      originAccessControlConfig: {
        name: 'clickstream-controlplane-oac-' + shortId,
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    });

    let responseHeadersPolicy = undefined;
    if (props.distributionProps?.responseHeadersPolicy) {
      responseHeadersPolicy = {
        responseHeadersPolicyId: props.distributionProps?.responseHeadersPolicy.responseHeadersPolicyId,
      };
    }

    const notOpsInRegion = new CfnCondition(this, 'notOpsInRegion', {
      expression: Fn.conditionOr(
        Fn.conditionEquals(Aws.REGION, 'us-east-1'),
        Fn.conditionEquals(Aws.REGION, 'us-east-2'),
        Fn.conditionEquals(Aws.REGION, 'us-west-1'),
        Fn.conditionEquals(Aws.REGION, 'us-west-2'),
        Fn.conditionEquals(Aws.REGION, 'ap-south-1'),
        Fn.conditionEquals(Aws.REGION, 'ap-northeast-1'),
        Fn.conditionEquals(Aws.REGION, 'ap-northeast-2'),
        Fn.conditionEquals(Aws.REGION, 'ap-northeast-3'),
        Fn.conditionEquals(Aws.REGION, 'ap-southeast-1'),
        Fn.conditionEquals(Aws.REGION, 'ap-southeast-2'),
        Fn.conditionEquals(Aws.REGION, 'ca-central-1'),
        Fn.conditionEquals(Aws.REGION, 'eu-central-1'),
        Fn.conditionEquals(Aws.REGION, 'eu-west-1'),
        Fn.conditionEquals(Aws.REGION, 'eu-west-2'),
        Fn.conditionEquals(Aws.REGION, 'eu-west-3'),
        Fn.conditionEquals(Aws.REGION, 'eu-north-1'),
        Fn.conditionEquals(Aws.REGION, 'sa-east-1'),
      ),
    });

    const distribution = new Distribution(this, 'PortalDistribution', {
      certificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      domainNames: domainName ? [domainName] : [],
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: props.distributionProps?.cachedMethods ?? CachedMethods.CACHE_GET_HEAD,
        cachePolicy: new CachePolicy(this, 'defaultCachePolicy', {
          cachePolicyName: `cachepolicy-${shortId}`,
          defaultTtl: Duration.days(7),
          minTtl: Duration.seconds(0),
          maxTtl: Duration.days(30),
        }),
        functionAssociations: props.distributionProps?.functionAssociations,
        responseHeadersPolicy: responseHeadersPolicy,
      },
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_200,
      enableIpv6: props.distributionProps?.enableIpv6 ?? false,
      comment: distDescription,
      httpVersion: HttpVersion.HTTP2_AND_3,
    });

    const portalDist = distribution.node.defaultChild as CfnDistribution;

    if (props.distributionProps?.logProps?.enableAccessLog) {
      (portalDist.distributionConfig as any).logging =
        Fn.conditionIf(notOpsInRegion.logicalId, {
          Bucket: this.logBucket.bucketRegionalDomainName,
          Prefix: props.distributionProps?.logProps?.prefix ?? 'cloudfront-access-log',
        }, Aws.NO_VALUE);
    } else {
      (portalDist.distributionConfig as any).logging = Aws.NO_VALUE;
    }

    addCfnNagSuppressRules(
      portalDist,
      [
        {
          id: 'W70', //Cloudfront should use minimum protocol version TLS 1.2
          reason: Constant.NAG_REASON_TLSV1_2_DEFAULT_CERT_DOMAIN,
        },
      ],
    );

    portalDist.addPropertyOverride(
      'DistributionConfig.Origins.0.OriginAccessControlId',
      oac.getAtt('Id'),
    );
    portalDist.addPropertyOverride(
      'DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity',
      '',
    );

    portalBucketPolicyStatement.addCondition('StringEquals', {
      'AWS:SourceArn': Arn.format({
        resource: 'distribution/' + distribution.distributionId,
        service: 'cloudfront',
        account: Aws.ACCOUNT_ID,
        region: '',
        partition: Aws.PARTITION,
        arnFormat: ArnFormat.COLON_RESOURCE_NAME,
      }),
    });

    return {
      distribution,
      portalBucketPolicyStatement,
    };
  }

  private createDistributionForCNRegions(portalBucket: IBucket, distDescription: string,
    props: FrontendAppPortalProps): {
      distribution: IDistribution;
      portalBucketPolicyStatement: PolicyStatement;
    } {
    const originAccessIdentity = new OriginAccessIdentity(this, 'origin_access_identity',
      {
        comment: 'portal-distribution-originAccessIdentity',
      },
    );
    new S3Origin(portalBucket, {
      originAccessIdentity: originAccessIdentity,
    });

    const portalBucketPolicyStatement = new PolicyStatement({
      actions: ['s3:GetObject'],
      effect: Effect.ALLOW,
      principals: [
        new CanonicalUserPrincipal(
          originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId,
        ),
      ],
      resources: [`${portalBucket.bucketArn}/*`],
    });

    const distribution = new CloudFrontWebDistribution(this, 'PortalDistribution', {
      enableIpV6: false,
      priceClass: PriceClass.PRICE_CLASS_ALL,
      defaultRootObject: 'index.html',
      viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: portalBucket,
            originAccessIdentity,
          },
          behaviors: [{
            isDefaultBehavior: true,
            forwardedValues: {
              queryString: false,
            },
            defaultTtl: Duration.days(7),
            maxTtl: Duration.days(30),
            allowedMethods: CloudFrontAllowedMethods.GET_HEAD,
            compress: true,
          }],
        },
      ],
      loggingConfig: {
        bucket: this.logBucket,
        prefix: 'cloudfront-access-log',
      },
      comment: distDescription,
    });

    const portalDist = distribution.node.defaultChild as CfnDistribution;
    portalDist.addPropertyOverride(
      'DistributionConfig.ViewerCertificate',
      {
        IamCertificateId: props.cnFrontendAppPortalProps!.iamCertificateId,
        SslSupportMethod: 'sni-only',
        CloudFrontDefaultCertificate: undefined,
        MinimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      },
    );

    portalDist.addPropertyOverride('DistributionConfig.Aliases', [
      props.cnFrontendAppPortalProps!.domainName,
    ]);

    addCfnNagSuppressRules(
      portalDist,
      [
        {
          id: 'W70', //Cloudfront should use minimum protocol version TLS 1.2
          reason: Constant.NAG_REASON_TLSV1_REQUIRED_CN_REGION,
        },
      ],
    );

    return {
      distribution,
      portalBucketPolicyStatement,
    };
  }

  private createBuckets(logBucket?: IBucket): {
    logBucket: IBucket;
    portalBucket: IBucket;
  } {
    const newLogBucket = logBucket ?? new Bucket(this, 'portal_log_bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsPrefix: 'log-bucket-access-log/',
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    const portalBucket = new Bucket(this, 'portal_bucket', {
      versioned: false,
      encryption: BucketEncryption.S3_MANAGED,
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      serverAccessLogsBucket: newLogBucket,
      serverAccessLogsPrefix: 'portal-bucket-access-log/',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    return {
      logBucket: newLogBucket,
      portalBucket,
    };
  }

  public addHttpOrigin(pathPattern: string, domainName: string, props: HttpOriginProps, behaviorOptions?: AddBehaviorOptions) {
    if (pathPattern === '*') {
      throw new Error('Only the default behavior can have a path pattern of \'*\'');
    }
    if (this.distribution instanceof Distribution) {
      this.distribution.addBehavior(
        pathPattern,
        new HttpOrigin(domainName, props),
        {
          viewerProtocolPolicy: behaviorOptions?.viewerProtocolPolicy ?? ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: behaviorOptions?.cachePolicy ?? CachePolicy.CACHING_DISABLED,
          allowedMethods: behaviorOptions?.allowedMethods ?? AllowedMethods.ALLOW_ALL,
          originRequestPolicy: behaviorOptions?.originRequestPolicy,
        },
      );
    } else {
      this.addOriginForWebDistribution(props, domainName, pathPattern, behaviorOptions);
    }
  }

  private addOriginForWebDistribution(props: HttpOriginProps, domainName: string,
    pathPattern: string, behaviorOptions: AddBehaviorOptions | undefined) {
    const cfnDistribution = this.distribution.node.defaultChild as CfnDistribution;
    // get current origins and cacheBehaviors
    if (isEmpty(this.origins)) {
      this.origins = (cfnDistribution.distributionConfig as CfnDistribution.DistributionConfigProperty).origins ?? [];
    }
    if (isEmpty(this.cacheBehaviors)) {
      this.cacheBehaviors = (cfnDistribution.distributionConfig as CfnDistribution.DistributionConfigProperty).cacheBehaviors ?? [];
    }

    const originsNum = (this.origins as Array<CfnDistribution.OriginProperty>).length;
    // Assemble new origin and behavior according to parameters
    const origin: CfnDistribution.OriginProperty = this.origin(props, domainName, originsNum);

    const behavior: any = {
      PathPattern: pathPattern,
      TargetOriginId: `origin${originsNum + 1}`,
      AllowedMethods: behaviorOptions?.allowedMethods?.methods ?? AllowedMethods.ALLOW_ALL.methods,
      CachedMethods: behaviorOptions?.cachedMethods?.methods ?? AllowedMethods.ALLOW_GET_HEAD.methods,
      Compress: behaviorOptions?.compress ?? true,
      ViewerProtocolPolicy: behaviorOptions?.viewerProtocolPolicy ?? ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      ForwardedValues: {
        QueryString: true,
        Cookies: { Forward: 'none' },
        Headers: ['Origin', 'Authorization', 'Accept', 'Cache-Control', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Referer'],
      },
      MaxTTL: 0,
      MinTTL: 0,
      DefaultTTL: 0,
    };

    (this.origins as Array<CfnDistribution.OriginProperty>).push(origin);
    (this.cacheBehaviors as Array<CfnDistribution.CacheBehaviorProperty>).push(behavior);
    cfnDistribution.addPropertyOverride('DistributionConfig.Origins', capitalizePropertyNames(this, this.origins));
    cfnDistribution.addPropertyOverride('DistributionConfig.CacheBehaviors', this.cacheBehaviors);
  }

  private origin(props: HttpOriginProps, domainName: string, originsNum: number): CfnDistribution.OriginProperty {
    return {
      connectionAttempts: props.connectionAttempts ?? 3,
      connectionTimeout: props.connectionTimeout?.toSeconds() ?? 10,
      customOriginConfig: {
        httpPort: props.httpPort ?? 80,
        httpsPort: props.httpsPort ?? 443,
        originKeepaliveTimeout: props.keepaliveTimeout?.toSeconds() ?? 5,
        originProtocolPolicy: props.protocolPolicy ?? OriginProtocolPolicy.HTTPS_ONLY,
        originReadTimeout: props.readTimeout?.toSeconds() ?? 30,
        originSslProtocols: props.originSslProtocols ?? [OriginSslPolicy.TLS_V1_2],
      },
      domainName: domainName,
      id: `origin${originsNum + 1}`,
      originPath: props.originPath,
    };
  }
}
