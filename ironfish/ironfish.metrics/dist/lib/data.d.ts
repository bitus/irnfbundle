export declare class TelemetryData {
    cpu: CpuData;
    memory: MemoryData;
    disk: DiskData;
    network: NetworkData;
    ironfish: IronfishData;
    wallet: IronfishWalletData;
    assign(item: TelemetryDataItem): void;
}
export declare abstract class TelemetryDataItem {
}
export declare class CpuData extends TelemetryDataItem {
    cores: number;
    utilization: number;
    cores_utilization: number[];
}
export declare class MemoryData extends TelemetryDataItem {
    free: number;
    used: number;
    total: number;
    utilization: number;
}
export declare class NetworkData extends TelemetryDataItem {
    input: number;
    output: number;
}
export declare class DiskData extends TelemetryDataItem {
    name: string;
    free: number;
    used: number;
    total: number;
    utilization: number;
}
declare class IronfishVersionData {
    current: string;
    latest: string;
    needs_update: boolean;
}
declare class IronfishMemoryData {
    free: number;
    used: number;
    total: number;
    utilization: number;
}
declare class IronfishCpuData {
    cores: number;
    utilization: number;
}
declare class IronfishP2pData {
    status: string;
    active: boolean;
    input: number;
    output: number;
    peers: number;
}
declare class IronfishMiningData {
    status: string;
    active: boolean;
    miners: number;
    mined: number;
}
declare class IronfishMemPoolData {
    count: number;
    bytes: number;
}
declare class IronfishSyncerPoolData {
    status: string;
    idle: boolean;
    speed: number;
}
declare class IronfishBlockchainPoolData {
    status: string;
    synced: boolean;
    since_head: number;
}
declare class IronfishWorkersPoolData {
    status: string;
    active: boolean;
    jobs_per_second: number;
}
export declare class IronfishWalletData extends TelemetryDataItem {
    address: string;
    balance: number;
}
export declare class IronfishData extends TelemetryDataItem {
    status: string;
    active: boolean;
    version: IronfishVersionData;
    memory: IronfishMemoryData;
    cpu: IronfishCpuData;
    p2p: IronfishP2pData;
    mining: IronfishMiningData;
    mem_pool: IronfishMemPoolData;
    syncer: IronfishSyncerPoolData;
    blockchain: IronfishBlockchainPoolData;
    workers: IronfishWorkersPoolData;
}
export {};
