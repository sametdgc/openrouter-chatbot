from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

def setup_telemetry(app):
    # 1. Define the resource (Service Name in Jaeger)
    resource = Resource.create(attributes={
        "service.name": "madlen-chat-api",
        "service.version": "1.0.0"
    })

    # 2. Configure the Tracer Provider
    tracer_provider = TracerProvider(resource=resource)
    
    # 3. Configure OTLP Exporter (Sends data to Jaeger Docker container)
    otlp_exporter = OTLPSpanExporter(endpoint="http://localhost:4317", insecure=True)
    
    # 4. Add the exporter to the provider
    tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
    
    # Set the global tracer provider
    trace.set_tracer_provider(tracer_provider)

    # 5. Instrument Requests (So calls to OpenRouter are visible in traces)
    RequestsInstrumentor().instrument()

    # 6. Instrument FastAPI (So incoming HTTP requests are visible)
    FastAPIInstrumentor.instrument_app(app, tracer_provider=tracer_provider)