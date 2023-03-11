import { execSync } from "node:child_process";
import { CpuData, DiskData, IronfishData, IronfishWalletData, MemoryData, NetworkData, TelemetryData, TelemetryDataItem } from "./data";

const debug = false;

function toKb(data: string | number, unit: string = ''): number {
    if (data) {
        if (typeof data === 'string') {
            let d = data.trim().replace(/\s+/img, ' ').split(' ');
            let value = parseFloat(d[0]);
            if (!isNaN(value)) {
                if (d.length === 2) {
                    let unit = d[1].toUpperCase().substring(0, 1);
                    return toKb(value, unit);
                } else {
                    return toKb(value);
                }
            }
        }
        else {
            if (unit === 'G') {
                data = data * 1024 * 1024 * 1024;
            } else if (unit === 'M') {
                data = data * 1024 * 1024;
            } else if (unit === 'K') {
                data = data * 1024;
            }

            return roundNum(data / 1024);
        }
    }

    return 0.0;
}

function roundNum(value: string | number, precision: number = 1): number {
    if (typeof value === 'string') {
        let v = parseFloat(value);
        if (!isNaN(v)) {
            return roundNum(v, precision);
        }
    } else {
        let ss = String(value).split('.');
        if (ss.length > 1) {
            let p1 = parseInt(ss[0]);
            let p2 = ss[1].substring(0, precision);

            return parseFloat(`${p1}.${p2}`);
        }

        return value;
    }

    return 0.0;
}

function parseSeconds(value: string): number {
    if (value) {
        let res = 0;
        let vv = value.trim().split(' ').map(x => x.trim()).filter(x => x !== '');

        for (let v of vv) {
            let num = parseInt(v.replace(/[^\d]/img, ''));

            if (!isNaN(num)) {
                let suffix = v.replace(/[\d]/img, '');
                if (suffix === 's') {
                    res += num;
                } else if (suffix === 'm') {
                    res += num * 60;
                } else if (suffix === 'h') {
                    res += num * 60 * 60;
                } else if (suffix === 'd') {
                    res += num * 60 * 60 * 24;
                }
            }
        }

        return res;
    }

    return 0;
}

function execShellCommand(cmd: string): string {
    try {
        if (debug) {
            return testOutput[cmd] ?? '';
        }

        let output = execSync(cmd);
        return output.toString();
    } catch (err) {
        return '';
    }
}


export abstract class Command {
    constructor(readonly name: string, readonly cmd: string) { }

    protected getLines(data: string): string[] {
        if (data) {
            return data.split(/\r\n|\n/igm);
        }

        return [];
    }

    async exec(): Promise<TelemetryDataItem> {
        let output = execShellCommand(this.cmd);

        return await this.parse(output);
    }

    protected abstract parse(data: string): Promise<TelemetryDataItem>;

    toString(): string {
        return `Command '${this.name}'`;
    }
}

export class DfCommand extends Command {
    constructor() {
        super('df', 'df');
    }

    async parse(input: string): Promise<TelemetryDataItem> {
        if (input) {
            let lines = this.getLines(input);
            if (lines && lines.length) {
                let ll = lines.filter(x => x.endsWith(' /'));
                if (ll.length) {
                    let s = ll[0].trim().replace(/\s+/img, ' ').split(' ').reverse().slice(1);
                    if (s && s.length > 2) {
                        let pcnt = parseInt(s[0].replace('%', ''));
                        let a = parseInt(s[1]);
                        let u = parseInt(s[2]);
                        if (!isNaN(pcnt) && !isNaN(a) && !isNaN(u)) {
                            let res = new DiskData();

                            res.name = '';
                            res.used = u;
                            res.free = a;
                            res.total = a + u;
                            res.utilization = pcnt;

                            return res;
                        }
                    }
                }
            }
        }

        return undefined;
    }
}

export class MpstatCommand extends Command {
    constructor() {
        super('mpstat', 'mpstat -P ALL');
    }

    async parse(input: string): Promise<TelemetryDataItem> {
        if (input) {
            let lines = this.getLines(input).slice(3);
            if (lines && lines.length) {
                let idx = lines[0].indexOf(' all ');
                if (idx > 0) {
                    let ll = lines.map(x => x.substring(idx).trim().replace(/\s+/gim, ' ').split(' ').slice(0, 2)).filter(x => x.length === 2);
                    let res = new CpuData();

                    res.cores = ll.length-1;
                    for (let l of ll) {
                        let n = parseInt(l[0]);
                        let v = parseInt(l[1]);
                        if (isNaN(n)) {
                            res.utilization = isNaN(v) ? 0.0 : v;
                        } else {
                            res.cores_utilization.push(isNaN(v) ? 0.0 : v);
                        }
                    }

                    return res;
                }
            }
        }

        return undefined;
    }
}

export class FreeCommand extends Command {
    constructor() {
        super('free', 'free');
    }

    async parse(input: string): Promise<TelemetryDataItem> {
        if (input) {
            let lines = this.getLines(input).slice(1);
            if (lines && lines.length) {

                let ll = (lines[0].split(':')[1] ?? '')
                    .trim().replace(/\s+/gim, ' ')
                    .split(' ')
                    .slice(0, 3)
                    .map(x => parseInt(x))
                    .filter(x => !isNaN(x));

                if (ll.length === 3) {
                    let res = new MemoryData();

                    res.total = ll[0];
                    res.used = ll[1];
                    res.free = ll[2];
                    res.utilization =
                        res.used * 100 / res.total;

                    return res;
                }
            }
        }

        return undefined;
    }

}

export class IfstatCommand extends Command {
    constructor() {
        super('ifstat', 'ifstat 1 1');
    }

    async parse(input: string): Promise<TelemetryDataItem> {
        if (input) {
            let lines = this.getLines(input).slice(1);
            if (lines && lines.length) {

                let h = lines[0].trim().replace(' in', '').replace(' out', '').replace(/\s+/img, ' ').split(' ').slice(0, 2).map(x => x.toUpperCase());
                let d = lines[1].trim().replace(/\s+/img, ' ').split(' ').slice(0, 2).map(x => parseFloat(x)).filter(x => !isNaN(x));
                if (h.length === 2 && d.length === 2) {
                    let res = new NetworkData();

                    res.input = d[0];
                    res.output = d[1];

                    return res;
                }
            }
        }

        return undefined;
    }
}

export class IronfishStatus extends Command {
    constructor() {
        super('ironfish.status', 'ironfish status');
    }

    private getLine(lines: string[], name: string): string {
        let ff = lines.filter(x => x.toUpperCase().indexOf(name.toUpperCase() + '  ') === 0);
        if (ff.length) {
            return ff[0].substring(name.length + 1).trim();
        }

        return '';
    }

    private dateLatestVersionCheck:Date;
    private latestVersion:string;

    private async getLatestVersion():Promise<string> {
        const url = 'https://github.com/iron-fish/ironfish/releases';
        try {
            let response = await fetch(url);
            let html = await response.text();
            var re = />v([0-9\.]+)<\/h2>/m;
            var match = re.exec(html);
            if (match != null) {
                this.latestVersion = match[1];
                this.dateLatestVersionCheck = new Date();
                return match[1];
            }
        }
        catch(err) {
            console.log(`Unable to check for latest ironfish version. ${err}`);
        }

        return '';
    }

    private async parseVersion(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let v = data.split('@')[0].trim();
            telemetry.version.current = v;

            if (this.dateLatestVersionCheck === undefined || (new Date().valueOf() - this.dateLatestVersionCheck.valueOf())/1000 > 60 * 30) {
                let lv = await this.getLatestVersion();

                telemetry.version.latest = lv;
            }

            telemetry.version.needs_update = telemetry.version.current &&
                telemetry.version.latest &&
                telemetry.version.current !== telemetry.version.latest;
        }
    }

    private async parseStatus(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            telemetry.status = data;
            telemetry.active = data === 'STARTED';
        }
    }

    private async parseMemory(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let d = data.split('Free:');
            if (d.length > 1) {
                let f = d[d.length - 1].trim();

                var re = /^([\d\.]+)\s+([A-z]{2,5})\s+\(([\d\.]+)\%\)$/img;
                var match = re.exec(f);
                if (match != null) {
                    let free = parseFloat(match[1]);
                    let unit = match[2].toUpperCase().substring(0, 1);
                    let freePcnt = parseFloat(match[3]);

                    if (!isNaN(free) && unit && !isNaN(freePcnt)) {
                        let total = free * 100 / freePcnt;

                        free = toKb(`${free} ${unit}`);
                        total = toKb(`${total} ${unit}`);

                        telemetry.memory.free = free;
                        telemetry.memory.total = total;
                        telemetry.memory.used = total - free;
                        telemetry.memory.utilization = 100-freePcnt;
                    }
                }

            }
        }
    }

    private async parseCpu(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let d = data.split(',').map(x => x.split(':')[1]).filter(x => x !== undefined);
            if (d.length === 2) {
                let c = parseInt(d[0].trim());
                let u = parseFloat(d[1].replace('%', '').trim());
                telemetry.cpu.cores = isNaN(c) ? 0 : c;
                telemetry.cpu.utilization = isNaN(u) ? 0.0 : u;
            }
        }
    }

    private async parseP2p(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let d = data.split(',');
            if (d.length === 3) {
                let nin = toKb(d[0].split(':').reverse()[0]);
                let nout = toKb(d[1].split(':').reverse()[0]);
                let peers = parseInt(d[2].split(' ').reverse()[0]);

                telemetry.p2p.status = d[0].trim().split(' ')[0].trim();
                telemetry.p2p.active = telemetry.p2p.status === 'CONNECTED';
                telemetry.p2p.input = isNaN(nin) ? 0.0 : nin;
                telemetry.p2p.output = isNaN(nout) ? 0.0 : nout;
                telemetry.p2p.peers = peers;
            }
        }
    }

    private async parseMining(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let d = data.split('-');
            telemetry.mining.status = d[0].trim();
            telemetry.mining.active = telemetry.mining.status === 'STARTED';

            if (d[1]) {
                let mm = d[1].trim().split(',').map(x => parseInt(x.trim().split(' ')[0])).filter(x => !isNaN(x));
                if (mm.length === 2) {

                    telemetry.mining.miners = mm[0];
                    telemetry.mining.mined = mm[1];
                }
            }
        }
    }

    private async parseMemPool(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let dd = data.trim().split(',').map(x => x.trim().split(':')[1]).filter(x => x !== undefined);
            if (dd.length == 2) {
                let c = parseInt(dd[0].trim().split(' ')[0]);
                telemetry.mem_pool.count = isNaN(c) ? 0 : c;
                telemetry.mem_pool.bytes = toKb(dd[1]);
            }
        }
    }

    private async parseSyncer(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let dd = data.trim().split('-');
            if (dd.length === 2) {
                let speed = parseFloat(dd[1].trim().split(' ')[0]);
                telemetry.syncer.status = dd[0].trim();
                telemetry.syncer.idle = telemetry.syncer.status === 'IDLE';
                telemetry.syncer.speed = isNaN(speed) ? 0.0 : speed;
            }
        }
    }

    private async parseBlockchain(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let dd = data.split(',');
            if (dd.length === 2) {
                let s = dd[1].trim().split(':')[1];
                if (s) {
                    let t = parseSeconds(s.split('(')[0].trim());
                    let status = (s.split('(')[1] ?? '').replace(')', '').trim();

                    telemetry.blockchain.status = status;
                    telemetry.blockchain.synced = telemetry.blockchain.status === 'SYNCED';
                    telemetry.blockchain.since_head = t;
                }
            }
        }
    }

    private async parseWorkers(telemetry:IronfishData, data: string): Promise<any> {
        if (data) {
            let wps = parseFloat(data.split(',').reverse()[0].trim().split(' ')[0]);

            telemetry.workers.status = data.split('-')[0].trim();
            telemetry.workers.active = telemetry.workers.status === 'STARTED';
            telemetry.workers.jobs_per_second = isNaN(wps) ? 0.0 : wps;
        }
    }

    async parse(input: string): Promise<TelemetryDataItem> {
        if (input) {
            let lines = this.getLines(input);
            if (lines && lines.length) {
                lines = lines.map(x => x.trim());

                let telemetry = new IronfishData();

                let pieces = {
                    'Version': (v) => this.parseVersion(telemetry, v),
                    'Node': (v) => this.parseStatus(telemetry, v),
                    'Memory': (v) => this.parseMemory(telemetry, v),
                    'CPU': (v) => this.parseCpu(telemetry, v),
                    'P2P Network': (v) => this.parseP2p(telemetry, v),
                    'Mining': (v) => this.parseMining(telemetry, v),
                    'Mem Pool': (v) => this.parseMemPool(telemetry, v),
                    'Syncer': (v) => this.parseSyncer(telemetry, v),
                    'Blockchain': (v) => this.parseBlockchain(telemetry, v),
                    'Workers': (v) => this.parseWorkers(telemetry, v),
                };

                for (let n of Object.keys(pieces)) {
                    try {
                        let content = this.getLine(lines, n);
                        await pieces[n](content);
                    } catch (err) {
                        console.log(`Unable to parse IRONFISH ${n} output, ${err}` );
                    }
                }

                return telemetry;
            }
        }

        return undefined;
    }
}

export class IronfishAccountBalance extends Command {
    constructor() {
        super('ironfish.wallet.balance', 'ironfish wallet:balance');
    }

    async parse(input: string): Promise<TelemetryDataItem> {
        if (input) {
            let lines = this.getLines(input).slice(1);
            if (lines && lines.length) {
                let l = lines[0].split('IRON ');
                if (l.length > 1) {
                    let b = Number.parseFloat(String(l[l.length - 1]));

                    if (!isNaN(b)) {
                        let res = new IronfishWalletData();

                        res.balance = b;

                        return res;
                    }
                }
            }
        }

        return undefined;
    }
}



const testOutput = {
    'mpstat -P ALL' : `Linux 5.10.0-21-amd64 (ironfish)        03/08/2023      _x86_64_        (4 CPU)

    01:29:08 PM  CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gnice   %idle
    01:29:08 PM  all   18.15    0.00    0.93    0.26    0.00    0.59    0.00    0.00    0.00   80.07
    01:29:08 PM    0   18.22    0.00    0.93    0.24    0.00    0.69    0.00    0.00    0.00   79.92
    01:29:08 PM    1   18.20    0.00    0.95    0.24    0.00    0.62    0.00    0.00    0.00   79.99
    01:29:08 PM    2   18.01    0.00    0.93    0.33    0.00    0.58    0.00    0.00    0.00   80.15
    01:29:08 PM    3   18.17    0.00    0.90    0.23    0.00    0.48    0.00    0.00    0.00   80.22
    `,
    'free': `               total        used        free      shared  buff/cache   available
    Mem:         4025324      865652      185712         736     2973960     2874484
    Swap:         998396       17408      980988
    `,
    'ifstat 1 1': `      ens192             docker0         br-295121006edd
    KB/s in  KB/s out   KB/s in  KB/s out   KB/s in  KB/s out
       3.29      4.18      0.00      0.00      0.00      0.00
   `,
   'ironfish status': `Version              0.1.70 @ 6fb75f4
   Node                 STARTED
   Node Name
   Block Graffiti
   Memory               Heap: 89.01 MiB -> 170.44 MiB / 1.92 GiB (4.5%), RSS: 686.01 MiB (17.5%), Free: 2.64 GiB (31.2%)
   CPU                  Cores: 4, Current: 11.8%
   P2P Network          CONNECTED - In: 4.15 KB/s, Out: 13.34 KB/s, peers 50
   Mining               STARTED - 0 miners, 0 mined
   Mem Pool             Count: 32 tx, Bytes: 61.49 KiB
   Syncer               IDLE - 6.73 blocks added/sec
   Blockchain           00000000000c7a9ffc73d096871f1f03f07fd9943ee2a989b8d8a0320d581809 (73296), Since HEAD: 27s 728ms (SYNCED)
   Accounts             00000000000c7a9ffc73d096871f1f03f07fd9943ee2a989b8d8a0320d581809 (73296)
   Telemetry            STARTED - 6137 <- 67 pending
   Workers              STARTED - 0 -> 0 / 3 - -0.03 jobs Δ, 3.51 jobs/s
   `,
   'ironfish wallet:balance': `Account: default
   Available Balance: $IRON 0.00000000
   `,
   'df': `Filesystem     1K-blocks     Used Available Use% Mounted on
   udev             4056080        0   4056080   0% /dev
   tmpfs             814796      736    814060   1% /run
   /dev/sda1       60624740 14591492  42921212  26% /
   tmpfs            4073976        0   4073976   0% /dev/shm
   tmpfs               5120        0      5120   0% /run/lock
   tmpfs             814792        0    814792   0% /run/user/1000
   `

}