import { TelemetryDataItem } from "./data";
export declare abstract class Command {
    readonly name: string;
    readonly cmd: string;
    constructor(name: string, cmd: string);
    protected getLines(data: string): string[];
    exec(): Promise<TelemetryDataItem>;
    protected abstract parse(data: string): Promise<TelemetryDataItem>;
    toString(): string;
}
export declare class DfCommand extends Command {
    constructor();
    parse(input: string): Promise<TelemetryDataItem>;
}
export declare class MpstatCommand extends Command {
    constructor();
    parse(input: string): Promise<TelemetryDataItem>;
}
export declare class FreeCommand extends Command {
    constructor();
    parse(input: string): Promise<TelemetryDataItem>;
}
export declare class IfstatCommand extends Command {
    constructor();
    parse(input: string): Promise<TelemetryDataItem>;
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
    parse(input: string): Promise<TelemetryDataItem>;
}
export declare class IronfishAccountBalance extends Command {
    constructor();
    parse(input: string): Promise<TelemetryDataItem>;
}
