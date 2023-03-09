

export class TelemetryData {
    system:SystemData = new SystemData();
    ironfish:IronfishData = new IronfishData();
}

class SystemData {
    cpu:CpuData = new CpuData();
    memory:MemoryData = new MemoryData();
    disk:DiskData = new DiskData();
    network:NetworkData = new NetworkData();
}

class CpuData {
    cores:number = 0;
    utilization:number = 0.0;
    cores_utilization:number[] = [];
}

class MemoryData {
    free:number = 0;
    used:number = 0;
    total:number = 0;
    utilization:number = 0;
}

class NetworkData {
    input:number = 0;
    output:number = 0;
}

class DiskData {
    free:number = 0;
    used:number = 0;
    total:number = 0;
    utilization:number = 0.0;
}

class IronfishVersionData {
    current:string = '';
    latest:string = '';
    needs_update:boolean = false;
}

class IronfishMemoryData {
    free:number = 0.0;
    used:number = 0.0;
    total:number = 0.0;
    utilization:number = 0.0;
}

class IronfishCpuData {
    cores:number = 0;
    utilization:number = 0.0;
}

class IronfishP2pData {
    status:string = '';
    active:boolean = false;
    input:number = 0.0;
    output:number = 0.0;
    peers:number = 0;
}

class IronfishMiningData {
    status:string = '';
    active:boolean = false;
    miners:number = 0;
    mined:number = 0.0;
}

class IronfishMemPoolData {
    count:number = 0;
    bytes:number = 0;
}

class IronfishSyncerPoolData {
    status:string = '';
    idle:boolean = false;
    speed:number = 0.0;
}

class IronfishBlockchainPoolData {
    status:string = '';
    synced:boolean = false;
    since_head:number = 0;
}

class IronfishWorkersPoolData {
    status:string = '';
    active:boolean = false;
    jobs_per_second:number = 0.0;
}

class IronfishWalletPoolData {
    balance:number = 0.0;
}



class IronfishData {
    status:string = '';
    active:boolean = false;

    version:IronfishVersionData = new IronfishVersionData();
    wallet:IronfishWalletPoolData = new IronfishWalletPoolData();
    memory:IronfishMemoryData = new IronfishMemoryData();
    cpu:IronfishCpuData = new IronfishCpuData();
    p2p:IronfishP2pData = new IronfishP2pData();
    mining:IronfishMiningData = new IronfishMiningData();
    mem_pool:IronfishMemPoolData = new IronfishMemPoolData();
    syncer:IronfishSyncerPoolData = new IronfishSyncerPoolData();
    blockchain:IronfishBlockchainPoolData = new IronfishBlockchainPoolData();
    workers:IronfishWorkersPoolData = new IronfishWorkersPoolData();
}