import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

@Injectable()
export class OpenTelemetryService implements OnApplicationShutdown {
  static initialize() {
    const traceExporter = new OTLPTraceExporter();
    const sdk = new NodeSDK({
      traceExporter,
      serviceName: 'api',
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
  }

  onApplicationShutdown() {
    // TODO: Flush
  }
}
