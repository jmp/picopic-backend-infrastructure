import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigatewayv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as certificateManager from '@aws-cdk/aws-certificatemanager';

const rootDomain = 'picopic.io';
const apiDomain = `api.${rootDomain}`;

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: rootDomain,
    });

    const certificate = new certificateManager.DnsValidatedCertificate(this, 'PicopicApiCertificate', {
      domainName: apiDomain,
      hostedZone,
    });

    const apiDomainName = new apigw.DomainName(this, 'PicopicApiDomainName', {
      certificate,
      domainName: apiDomain
    });

    const httpApi = new apigw.HttpApi(this, 'PicopicHttpApi', {
      apiName: 'Picopic API',
      corsPreflight: {
        allowOrigins: [`https://${rootDomain}`],
        allowMethods: [apigw.CorsHttpMethod.GET],
      },
      defaultDomainMapping: {
        domainName: apiDomainName,
      }
    });

    new cdk.CfnOutput(this, 'PicopicHttpApiId', {
      value: httpApi.httpApiId,
      description: 'Picopic HTTP API Gateway',
      exportName: 'PicopicHttpApiId',
    });

    new route53.ARecord(this, 'PicopicHttpApiARecord', {
      recordName: apiDomain,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.ApiGatewayv2DomainProperties(
          apiDomainName.regionalDomainName,
          apiDomainName.regionalHostedZoneId,
        )
      ),
    });
  }
}
