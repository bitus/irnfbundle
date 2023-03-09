import { TelemetryData } from "./data";
export declare abstract class Command {
    readonly name: string;
    readonly cmd: string;
    constructor(name: string, cmd: string);
    protected getLines(data: string): string[];
    exec(telemetry: TelemetryData): Promise<TelemetryData>;
    protected abstract parse(telemetry: TelemetryData, data: string): Promise<any>;
    toString(): string;
}
export declare class DfCommand extends Command {
    constructor();
    parse(telemetry: TelemetryData, input: string): Promise<any>;
}
export declare class MpstatCommand extends Command {
    constructor();
    parse(telemetry: TelemetryData, input: string): Promise<any>;
}
export declare class FreeCommand extends Command {
    constructor();
    parse(telemetry: TelemetryData, input: string): Promise<any>;
}
export declare class IfstatCommand extends Command {
    constructor();
    parse(telemetry: TelemetryData, input: string): Promise<any>;
}
export declare class IronfishStatus extends Command {
    constructor();
    private getLine;
    private dateLatestVersionCheck;
    private latestVersion;
    private getLatestVersion;
    private parseVersion;
    private parseStatus;
    private parseMemory;
    private parseCpu;
    private parseP2p;
    private parseMining;
    private parseMemPool;
    private parseSyncer;
    private parseBlockchain;
    private parseWorkers;
    parse(telemetry: TelemetryData, input: string): Promise<any>;
}
export declare class IronfishAccountBalance extends Command {
    constructor();
    parse(telemetry: TelemetryData, input: string): Promise<any>;
}
