

export class TelemetryData {
    cpu:CpuData = new CpuData();
    memory:MemoryData = new MemoryData();
    disk:DiskData = new DiskData();
    network:NetworkData = new NetworkData();
    ironfish:IronfishData = new IronfishData();
    wallet:IronfishWalletData = new IronfishWalletData();

    assign(item:TelemetryDataItem) {
        if (item instanceof CpuData) {
            this.cpu = item;
        }
        else if (item instanceof MemoryData) {
            this.memory = item;
        }
        else if (item instanceof DiskData) {
            this.disk = item;
        }
        else if (item instanceof NetworkData) {
            this.network = item;
        }
        else if (item instanceof IronfishData) {
            this.ironfish = item;
        }
        else if (item instanceof IronfishWalletData) {
            this.wallet = item;
        }

    }
}

export abstract class TelemetryDataItem {

}

export class CpuData extends TelemetryDataItem {
    cores:number = 0;
    utilization:number = 0.0;
    cores_utilization:number[] = [];
}

export class MemoryData extends TelemetryDataItem {
    free:number = 0;
    used:number = 0;
    total:number = 0;
    utilization:number = 0;
}

export class NetworkData extends TelemetryDataItem {
    input:number = 0;
    output:number = 0;
}

export class DiskData extends TelemetryDataItem {
    name:string;
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

export class IronfishWalletData extends TelemetryDataItem {
    address:string;
    balance:number = 0.0;
}



export class IronfishData extends TelemetryDataItem {
    status:string = '';
    active:boolean = false;

    version:IronfishVersionData = new IronfishVersionData();
    memory:IronfishMemoryData = new IronfishMemoryData();
    cpu:IronfishCpuData = new IronfishCpuData();
    p2p:IronfishP2pData = new IronfishP2pData();
    mining:IronfishMiningData = new IronfishMiningData();
    mem_pool:IronfishMemPoolData = new IronfishMemPoolData();
    syncer:IronfishSyncerPoolData = new IronfishSyncerPoolData();
    blockchain:IronfishBlockchainPoolData = new IronfishBlockchainPoolData();
    workers:IronfishWorkersPoolData = new IronfishWorkersPoolData();
}