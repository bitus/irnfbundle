"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricGenerator = void 0;
const prom = __importStar(require("prom-client"));
let dataMetrics = [
    { name: 'ironfish.needs_update', reader: (data) => data.ironfish.version.needs_update ? 1 : 0 },
    { name: 'ironfish.active', reader: (data) => data.ironfish.active ? 1 : 0 },
    { name: 'system.cpu.utilization', reader: (data) => data.cpu.utilization },
    { name: 'system.cpu.cores', reader: (data) => data.cpu.cores },
    { name: 'system.memory.free', reader: (data) => data.memory.free },
    { name: 'system.memory.used', reader: (data) => data.memory.used },
    { name: 'system.memory.total', reader: (data) => data.memory.total },
    { name: 'system.memory.utilization', reader: (data) => data.memory.utilization },
    { name: 'system.disk.free', reader: (data) => data.disk.free },
    { name: 'system.disk.used', reader: (data) => data.disk.used },
    { name: 'system.disk.total', reader: (data) => data.disk.total },
    { name: 'system.disk.utilization', reader: (data) => data.disk.utilization },
    { name: 'system.network.input', reader: (data) => data.network.input },
    { name: 'system.network.output', reader: (data) => data.network.output },
    { name: 'ironfish.active', reader: (data) => data.ironfish.active ? 1 : 0 },
    { name: 'ironfish.cpu.cores', reader: (data) => data.ironfish.cpu.cores },
    { name: 'ironfish.cpu.utilization', reader: (data) => data.ironfish.cpu.utilization },
    { name: 'ironfish.memory.free', reader: (data) => data.ironfish.memory.free },
    { name: 'ironfish.memory.used', reader: (data) => data.ironfish.memory.used },
    { name: 'ironfish.memory.total', reader: (data) => data.ironfish.memory.total },
    { name: 'ironfish.memory.utilization', reader: (data) => data.ironfish.memory.utilization },
    { name: 'ironfish.p2p.active', reader: (data) => data.ironfish.p2p.active ? 1 : 0 },
    { name: 'ironfish.p2p.input', reader: (data) => data.ironfish.p2p.input },
    { name: 'ironfish.p2p.output', reader: (data) => data.ironfish.p2p.output },
    { name: 'ironfish.p2p.peers', reader: (data) => data.ironfish.p2p.peers },
    { name: 'ironfish.mining.active', reader: (data) => data.ironfish.mining.active ? 1 : 0 },
    { name: 'ironfish.mining.miners', reader: (data) => data.ironfish.mining.miners },
    { name: 'ironfish.mining.mined', reader: (data) => data.ironfish.mining.mined },
    { name: 'ironfish.mem_pool.bytes', reader: (data) => data.ironfish.mem_pool.bytes },
    { name: 'ironfish.mem_pool.count', reader: (data) => data.ironfish.mem_pool.count },
    { name: 'ironfish.syncer.idle', reader: (data) => data.ironfish.syncer.idle ? 1 : 0 },
    { name: 'ironfish.syncer.speed', reader: (data) => data.ironfish.syncer.speed },
    { name: 'ironfish.blockchain.synced', reader: (data) => data.ironfish.blockchain.synced ? 1 : 0 },
    { name: 'ironfish.blockchain.since_head', reader: (data) => data.ironfish.blockchain.since_head },
    { name: 'ironfish.workers.jobs_per_second', reader: (data) => data.ironfish.workers.jobs_per_second },
    { name: 'ironfish.wallet.balance', reader: (data) => data.wallet.balance },
];
class MetricGenerator {
    _registered;
    metrics = [];
    async generate(telemetry) {
        if (!this._registered) {
            this.register();
        }
        prom.register.resetMetrics();
        for (let mm of this.metrics) {
            try {
                if (mm.promMetric instanceof prom.Gauge) {
                    mm.promMetric.set({}, mm.dataMetric.reader(telemetry));
                }
                else if (mm.promMetric instanceof prom.Counter) {
                    mm.promMetric.inc({}, mm.dataMetric.reader(telemetry));
                }
            }
            catch (err) {
                console.error(`Unable to update metric '${mm.dataMetric.name}'. ${err}`);
            }
        }
        return await prom.register.metrics();
    }
    register() {
        if (this._registered) {
            return;
        }
        for (let m of dataMetrics) {
            let t = m.type ?? 'gauge';
            let mn = m.name.replace(/\./img, '_');
            if (t.toLowerCase().indexOf('c') == 0) {
                let metric = new prom.Counter({
                    name: mn,
                    help: `${m.description || m.name} value`,
                });
                this.metrics.push({ promMetric: metric, dataMetric: m });
            }
            else {
                let metric = new prom.Gauge({
                    name: mn,
                    help: `${m.description || m.name} value`,
                });
                this.metrics.push({ promMetric: metric, dataMetric: m });
            }
        }
        this._registered = true;
    }
    async getMetrics(telemetry) {
        if (!this._registered) {
            this.register();
        }
        return await this.generate(telemetry);
    }
}
exports.metricGenerator = new MetricGenerator();
//# sourceMappingURL=metrics.js.map