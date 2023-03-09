export declare class TelemetryData {
    system: SystemData;
    ironfish: IronfishData;
}
declare class SystemData {
    cpu: CpuData;
    memory: MemoryData;
    disk: DiskData;
    network: NetworkData;
}
declare class CpuData {
    cores: number;
    utilization: number;
    cores_utilization: number[];
}
declare class MemoryData {
    free: number;
    used: number;
    total: number;
    utilization: number;
}
declare class NetworkData {
    input: number;
    output: number;
}
declare class DiskData {
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
declare class IronfishWalletPoolData {
    balance: number;
}
declare class IronfishData {
    status: string;
    active: boolean;
    version: IronfishVersionData;
    wallet: IronfishWalletPoolData;
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
