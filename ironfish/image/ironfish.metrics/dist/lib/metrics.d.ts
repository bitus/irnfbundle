import { TelemetryData } from "./data";
declare class MetricGenerator {
    private _registered;
    private metrics;
    private generate;
    register(): void;
    getMetrics(telemetry: TelemetryData): Promise<string>;
}
export declare const metricGenerator: MetricGenerator;
export {};
