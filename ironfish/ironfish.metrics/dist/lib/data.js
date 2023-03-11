"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IronfishData = exports.IronfishWalletData = exports.DiskData = exports.NetworkData = exports.MemoryData = exports.CpuData = exports.TelemetryDataItem = exports.TelemetryData = void 0;
class TelemetryData {
    cpu = new CpuData();
    memory = new MemoryData();
    disk = new DiskData();
    network = new NetworkData();
    ironfish = new IronfishData();
    wallet = new IronfishWalletData();
    assign(item) {
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
exports.TelemetryData = TelemetryData;
class TelemetryDataItem {
}
exports.TelemetryDataItem = TelemetryDataItem;
class CpuData extends TelemetryDataItem {
    cores = 0;
    utilization = 0.0;
    cores_utilization = [];
}
exports.CpuData = CpuData;
class MemoryData extends TelemetryDataItem {
    free = 0;
    used = 0;
    total = 0;
    utilization = 0;
}
exports.MemoryData = MemoryData;
class NetworkData extends TelemetryDataItem {
    input = 0;
    output = 0;
}
exports.NetworkData = NetworkData;
class DiskData extends TelemetryDataItem {
    name;
    free = 0;
    used = 0;
    total = 0;
    utilization = 0.0;
}
exports.DiskData = DiskData;
class IronfishVersionData {
    current = '';
    latest = '';
    needs_update = false;
}
class IronfishMemoryData {
    free = 0.0;
    used = 0.0;
    total = 0.0;
    utilization = 0.0;
}
class IronfishCpuData {
    cores = 0;
    utilization = 0.0;
}
class IronfishP2pData {
    status = '';
    active = false;
    input = 0.0;
    output = 0.0;
    peers = 0;
}
class IronfishMiningData {
    status = '';
    active = false;
    miners = 0;
    mined = 0.0;
}
class IronfishMemPoolData {
    count = 0;
    bytes = 0;
}
class IronfishSyncerPoolData {
    status = '';
    idle = false;
    speed = 0.0;
}
class IronfishBlockchainPoolData {
    status = '';
    synced = false;
    since_head = 0;
}
class IronfishWorkersPoolData {
    status = '';
    active = false;
    jobs_per_second = 0.0;
}
class IronfishWalletData extends TelemetryDataItem {
    address;
    balance = 0.0;
}
exports.IronfishWalletData = IronfishWalletData;
class IronfishData extends TelemetryDataItem {
    status = '';
    active = false;
    version = new IronfishVersionData();
    memory = new IronfishMemoryData();
    cpu = new IronfishCpuData();
    p2p = new IronfishP2pData();
    mining = new IronfishMiningData();
    mem_pool = new IronfishMemPoolData();
    syncer = new IronfishSyncerPoolData();
    blockchain = new IronfishBlockchainPoolData();
    workers = new IronfishWorkersPoolData();
}
exports.IronfishData = IronfishData;
//# sourceMappingURL=data.js.map