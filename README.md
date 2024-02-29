# AWS CDK Construct for Deploying Frontend Application

A CDK construct which deploy a frontend application on S3, capped by CloudFront to speed up user access.

## Construct Overview

This CDK construct will deploy your frontend applications, like a React JS application, to an AWS S3 bucket, while adding a CloudFront distribution in front of the S3 bucket. Though a series of parameters of the construct, you can control the behaviour of it, like deploying the application to China regions or to global regions, using your own domain name for the application or how to build the application, etc.

## Preparations before Using the Construct
To user AWS CDK, you have to:
```
    - Make sure you have an AWS account
    - Configure [credential of aws cli][configure-aws-cli]
    - Install Node.js LTS version 18.17.0 or later
    - Install Docker Engine
    - Install the dependencies of the solution by executing the command `yarn install --check-files && npx projen`
    - Initialize the CDK toolkit stack into AWS environment (only for deploying via [AWS CDK][aws-cdk] for the first time), and run `npx cdk bootstrap`
    - A domain. You will use this domain to access the frontend application. This is required for AWS China Regions, and is optional for AWS Regions.
    - The SSL must be associated with the given domain. Follow this [guide](https://docs.aws.amazon.com/solutions/latest/clickstream-analytics-on-aws/additional-resources.html#upload-ssl-certificate-to-iam) to upload SSL certificate to IAM. This is required for AWS China Regions, but is not recommended for AWS Regions.
```
Make sure to request or import the ACM certificate in the US East (N. Virginia) Region (us-east-1). This is not required for AWS China Regions, and is optional for AWS Regions.

## How to Install the Construct
npm install frontend-app-deployer

## How to Use the Construct
Here, an example TypeScript code snippet is used to illustrate the usage of the construct.

```
new FrontendAppDeployer(this, 'example-frontend-app', {
  targetToCNRegions: false,
  buildScript: 'export APP_PATH=/tmp/app && export NODE_OPTIONS=--openssl-legacy-provider && mkdir $APP_PATH && cd ./frontend/ && find -L . -type f -not -path "./build/*" -not -path "./node_modules/*" \
      -exec cp --parents {} $APP_PATH \\; && cd $APP_PATH && yarn install --loglevel error && yarn run build --loglevel error && cp -r ./build/* /asset-output/',
  baseImageForBuilding: 'public.ecr.aws/docker/library/node:18',
  useCustomDomainName: true,
  domainName: 'example.com',
  iamCertificateId: 'ASCAXTESTCERTNAMEVKPB',
});
```

## Parameters of the Construct
    - targetToCNRegions, boolean. true, if the application should be deployed to China regions(ZHY or BJS); false, if the application should be deployed to global regions.
    - buildScript, string. The commands in string format to build the frontend application.
    - baseImageForBuilding, string. An docker image publicly available, to run the build script in.
    - useCustomDomainName, boolean. true, if the application should have a custom domain associated to the CloudFront distribution; false, if the application will use the AWS-generated domain name for the CloudFront distribution. 
    - domainName, string. If using in China retions, specify the custom domain name which is under your control, or else, it can be left blank.
    - iamCertificateId, string. If using in China retions, specify the certificate ID, or else, it can be left blank. Please follow this [guide](https://docs.aws.amazon.com/solutions/latest/clickstream-analytics-on-aws/additional-resources.html#upload-ssl-certificate-to-iam) to upload the certificate and get the ID of it.
    - assetPath, string. The folder where the frontend assets reside.

## License

This project is licensed under the Apache-2.0 License.
