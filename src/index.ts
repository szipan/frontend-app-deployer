import { join } from 'path';
import { Aspects, IAspect, CfnResource, Fn, DockerImage, Aws, CfnOutput } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CfnDistribution,
  ResponseHeadersPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct, IConstruct } from 'constructs';
import { FRONTEND_APP_URL } from './common/constant';
import { SolutionBucket } from './common/solution-bucket';
import { FrontendAppPortal, CNFrontendAppPortalProps, DomainProps } from './frontend-app/frontend-app-portal';
import { generateFrontendConfig, FRONTEND_CONFIG_PATH } from './frontend-app/private/solution-config';

export interface FrontendAppDeployerProps {
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

export class FrontendAppDeployer extends Construct {
  constructor(scope: Construct, id: string, props?: FrontendAppDeployerProps) {
    super(scope, id);

    let domainProps: DomainProps | undefined = undefined;
    const deployerBucket = new SolutionBucket(this, 'FrontendAppDeployer');
    let cnFrontendAppPortalProps: CNFrontendAppPortalProps | undefined;
    if (props?.targetToCNRegions) {
      cnFrontendAppPortalProps = {
        domainName: props.domainName ?? '',
        iamCertificateId: props.iamCertificateId ?? '',
      };

      Aspects.of(this).add(new InjectCustomResourceConfig('true'));
    } else {
      if (props?.useCustomDomainName) {
        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'hostZone', {
          hostedZoneId: props?.hostedZoneId ?? '',
          zoneName: props?.hostedZoneName ?? '',
        });

        const certificate = new DnsValidatedCertificate(this, 'certificate', {
          domainName: Fn.join('.', [props?.recordName ?? '', props?.hostedZoneName ?? '']),
          hostedZone: hostedZone,
          region: 'us-east-1',
        });

        domainProps = {
          hostZone: hostedZone,
          recordName: props?.recordName ?? '',
          certificate: certificate,
        };
      }
    }

    let responseHeadersPolicy: ResponseHeadersPolicy | undefined = undefined;

    const frontendApp = new FrontendAppPortal(this, 'frontend_app', {
      frontendProps: {
        assetPath: join(__dirname, '..'),

        dockerImage: DockerImage.fromRegistry((props?.baseImageForBuilding ?? '').toString()),
        buildCommand: [
          'bash', '-c',
          (props?.buildScript ?? '').toString(),
        ],
        environment: {
          GENERATE_SOURCEMAP: process.env.GENERATE_SOURCEMAP ?? 'false',
        },
        user: 'node',
        autoInvalidFilePaths: ['/index.html', '/asset-manifest.json', '/robots.txt', FRONTEND_CONFIG_PATH, '/locales/*'],
      },
      cnFrontendAppPortalProps,
      domainProps,
      distributionProps: {
        logProps: {
          enableAccessLog: true,
          bucket: deployerBucket.bucket,
        },
        responseHeadersPolicy,
      },
    });

    // upload config to S3
    const key = FRONTEND_CONFIG_PATH.substring(1); //remove slash
    const awsExports = generateFrontendConfig({
      frontendVersion: process.env.BUILD_VERSION || 'v1',
      frontendBucket: deployerBucket.bucket.bucketName,
      frontendPluginPrefix: '',
      frontendRegion: Aws.REGION,
    });

    frontendApp.bucketDeployment.addSource(Source.jsonData(key, awsExports));

    if (props?.targetToCNRegions) {
      const frontendDist = frontendApp.distribution.node.defaultChild as CfnDistribution;

      //This is a tricky to avoid 403 error when access paths except /index.html
      frontendDist.addPropertyOverride(
        'DistributionConfig.CustomErrorResponses',
        [
          {
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
          },
        ],
      );
    }

    new CfnOutput(this, FRONTEND_APP_URL, {
      description: 'The url of clickstream console',
      value: frontendApp.frontendAppUrl,
    }).overrideLogicalId(FRONTEND_APP_URL);
  }
}

class InjectCustomResourceConfig implements IAspect {
  public constructor(private isInstallLatestAwsSdk: string) { }

  public visit(node: IConstruct): void {
    if (
      node instanceof CfnResource &&
      node.cfnResourceType === 'Custom::AWS'
    ) {
      node.addPropertyOverride('InstallLatestAwsSdk', this.isInstallLatestAwsSdk);
    }
  }
}
