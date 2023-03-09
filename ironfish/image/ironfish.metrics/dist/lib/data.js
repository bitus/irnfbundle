"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryData = void 0;
class TelemetryData {
    system = new SystemData();
    ironfish = new IronfishData();
}
exports.TelemetryData = TelemetryData;
class SystemData {
    cpu = new CpuData();
    memory = new MemoryData();
    disk = new DiskData();
    network = new NetworkData();
}
class CpuData {
    cores = 0;
    utilization = 0.0;
    cores_utilization = [];
}
class MemoryData {
    free = 0;
    used = 0;
    total = 0;
    utilization = 0;
}
class NetworkData {
    input = 0;
    output = 0;
}
class DiskData {
    free = 0;
    used = 0;
    total = 0;
    utilization = 0.0;
}
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
class IronfishWalletPoolData {
    balance = 0.0;
}
class IronfishData {
    status = '';
    active = false;
    version = new IronfishVersionData();
    wallet = new IronfishWalletPoolData();
    memory = new IronfishMemoryData();
    cpu = new IronfishCpuData();
    p2p = new IronfishP2pData();
    mining = new IronfishMiningData();
    mem_pool = new IronfishMemPoolData();
    syncer = new IronfishSyncerPoolData();
    blockchain = new IronfishBlockchainPoolData();
    workers = new IronfishWorkersPoolData();
}
//# sourceMappingURL=data.js.map