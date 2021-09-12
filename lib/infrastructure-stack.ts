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

    // Container for routing traffic for the domain.
    // Amazon Route 53 must be configured as the DNS service for the domain.
    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: rootDomain,
    });

    // TLS certificate for the API subdomain
    const certificate = new certificateManager.DnsValidatedCertificate(this, 'PicopicApiCertificate', {
      domainName: apiDomain,
      hostedZone,
    });

    // We want a custom domain name for our API gateway using the above TLS certificate
    const apiDomainName = new apigw.DomainName(this, 'PicopicApiDomainName', {
      certificate,
      domainName: apiDomain
    });

    // Define the HTTP API
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

    // We need a reference to the API gateway from each microservice
    // to be able to add new routes to the gateway.
    new cdk.CfnOutput(this, 'PicopicHttpApiId', {
      value: httpApi.httpApiId,
      description: 'Picopic HTTP API Gateway',
      exportName: 'PicopicHttpApiId',
    });

    // Alias record to allow users to access the API via the subdomain
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
