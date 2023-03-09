"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IronfishAccountBalance = exports.IronfishStatus = exports.IfstatCommand = exports.FreeCommand = exports.MpstatCommand = exports.DfCommand = exports.Command = void 0;
const node_child_process_1 = require("node:child_process");
const debug = false;
function toKb(data, unit = '') {
    if (data) {
        if (typeof data === 'string') {
            let d = data.trim().replace(/\s+/img, ' ').split(' ');
            let value = parseFloat(d[0]);
            if (!isNaN(value)) {
                if (d.length === 2) {
                    let unit = d[1].toUpperCase().substring(0, 1);
                    return toKb(value, unit);
                }
                else {
                    return toKb(value);
                }
            }
        }
        else {
            if (unit === 'G') {
                data = data * 1024 * 1024 * 1024;
            }
            else if (unit === 'M') {
                data = data * 1024 * 1024;
            }
            else if (unit === 'K') {
                data = data * 1024;
            }
            return roundNum(data / 1024);
        }
    }
    return 0.0;
}
function roundNum(value, precision = 1) {
    if (typeof value === 'string') {
        let v = parseFloat(value);
        if (!isNaN(v)) {
            return roundNum(v, precision);
        }
    }
    else {
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
function parseSeconds(value) {
    if (value) {
        let res = 0;
        let vv = value.trim().split(' ').map(x => x.trim()).filter(x => x !== '');
        for (let v of vv) {
            let num = parseInt(v.replace(/[^\d]/img, ''));
            if (!isNaN(num)) {
                let suffix = v.replace(/[\d]/img, '');
                if (suffix === 's') {
                    res += num;
                }
                else if (suffix === 'm') {
                    res += num * 60;
                }
                else if (suffix === 'h') {
                    res += num * 60 * 60;
                }
                else if (suffix === 'd') {
                    res += num * 60 * 60 * 24;
                }
            }
        }
        return res;
    }
    return 0;
}
function execShellCommand(cmd) {
    try {
        if (debug) {
            return testOutput[cmd] ?? '';
        }
        let output = (0, node_child_process_1.execSync)(cmd);
        return output.toString();
    }
    catch (err) {
        return '';
    }
}
class Command {
    name;
    cmd;
    constructor(name, cmd) {
        this.name = name;
        this.cmd = cmd;
    }
    getLines(data) {
        if (data) {
            return data.split(/\r\n|\n/igm);
        }
        return [];
    }
    async exec(telemetry) {
        let output = execShellCommand(this.cmd);
        await this.parse(telemetry, output);
        return telemetry;
    }
    toString() {
        return `Command '${this.name}'`;
    }
}
exports.Command = Command;
class DfCommand extends Command {
    constructor() {
        super('df', 'df');
    }
    async parse(telemetry, input) {
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
                            telemetry.system.disk.used = u;
                            telemetry.system.disk.free = a;
                            telemetry.system.disk.total = a + u;
                            telemetry.system.disk.utilization = pcnt;
                        }
                    }
                }
            }
        }
        return {};
    }
}
exports.DfCommand = DfCommand;
class MpstatCommand extends Command {
    constructor() {
        super('mpstat', 'mpstat -P ALL');
    }
    async parse(telemetry, input) {
        if (input) {
            let lines = this.getLines(input).slice(3);
            if (lines && lines.length) {
                let idx = lines[0].indexOf(' all ');
                if (idx > 0) {
                    let ll = lines.map(x => x.substring(idx).trim().replace(/\s+/gim, ' ').split(' ').slice(0, 2)).filter(x => x.length === 2);
                    telemetry.system.cpu.cores = ll.length - 1;
                    for (let l of ll) {
                        let n = parseInt(l[0]);
                        let v = parseInt(l[1]);
                        if (isNaN(n)) {
                            telemetry.system.cpu.utilization = isNaN(v) ? 0.0 : v;
                        }
                        else {
                            telemetry.system.cpu.cores_utilization.push(isNaN(v) ? 0.0 : v);
                        }
                    }
                }
            }
        }
        return {};
    }
}
exports.MpstatCommand = MpstatCommand;
class FreeCommand extends Command {
    constructor() {
        super('free', 'free');
    }
    async parse(telemetry, input) {
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
                    telemetry.system.memory.total = ll[0];
                    telemetry.system.memory.used = ll[1];
                    telemetry.system.memory.free = ll[2];
                    telemetry.system.memory.utilization =
                        telemetry.system.memory.used * 100 / telemetry.system.memory.total;
                }
            }
        }
        return {};
    }
}
exports.FreeCommand = FreeCommand;
class IfstatCommand extends Command {
    constructor() {
        super('ifstat', 'ifstat 1 1');
    }
    async parse(telemetry, input) {
        if (input) {
            let lines = this.getLines(input).slice(1);
            if (lines && lines.length) {
                let h = lines[0].trim().replace(' in', '').replace(' out', '').replace(/\s+/img, ' ').split(' ').slice(0, 2).map(x => x.toUpperCase());
                let d = lines[1].trim().replace(/\s+/img, ' ').split(' ').slice(0, 2).map(x => parseFloat(x)).filter(x => !isNaN(x));
                if (h.length === 2 && d.length === 2) {
                    telemetry.system.network.input = d[0];
                    telemetry.system.network.output = d[1];
                }
            }
        }
    }
}
exports.IfstatCommand = IfstatCommand;
class IronfishStatus extends Command {
    constructor() {
        super('ironfish.status', 'ironfish status');
    }
    getLine(lines, name) {
        let ff = lines.filter(x => x.toUpperCase().indexOf(name.toUpperCase() + '  ') === 0);
        if (ff.length) {
            return ff[0].substring(name.length + 1).trim();
        }
        return '';
    }
    dateLatestVersionCheck;
    latestVersion;
    async getLatestVersion() {
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
        catch (err) {
            console.log(`Unable to check for latest ironfish version. ${err}`);
        }
        return '';
    }
    async parseVersion(telemetry, data) {
        if (data) {
            let v = data.split('@')[0].trim();
            telemetry.ironfish.version.current = v;
            if (this.dateLatestVersionCheck === undefined || (new Date().valueOf() - this.dateLatestVersionCheck.valueOf()) / 1000 > 60 * 30) {
                let lv = await this.getLatestVersion();
                telemetry.ironfish.version.latest = lv;
            }
            telemetry.ironfish.version.needs_update = telemetry.ironfish.version.current &&
                telemetry.ironfish.version.latest &&
                telemetry.ironfish.version.current !== telemetry.ironfish.version.latest;
        }
    }
    async parseStatus(telemetry, data) {
        if (data) {
            telemetry.ironfish.status = data;
            telemetry.ironfish.active = data === 'STARTED';
        }
    }
    async parseMemory(telemetry, data) {
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
                        telemetry.ironfish.memory.free = free;
                        telemetry.ironfish.memory.total = total;
                        telemetry.ironfish.memory.used = total - free;
                        telemetry.ironfish.memory.utilization = 100 - freePcnt;
                    }
                }
            }
        }
    }
    async parseCpu(telemetry, data) {
        if (data) {
            let d = data.split(',').map(x => x.split(':')[1]).filter(x => x !== undefined);
            if (d.length === 2) {
                let c = parseInt(d[0].trim());
                let u = parseFloat(d[1].replace('%', '').trim());
                telemetry.ironfish.cpu.cores = isNaN(c) ? 0 : c;
                telemetry.ironfish.cpu.utilization = isNaN(u) ? 0.0 : u;
            }
        }
    }
    async parseP2p(telemetry, data) {
        if (data) {
            let d = data.split(',');
            if (d.length === 3) {
                let nin = toKb(d[0].split(':').reverse()[0]);
                let nout = toKb(d[1].split(':').reverse()[0]);
                let peers = parseInt(d[2].split(' ').reverse()[0]);
                telemetry.ironfish.p2p.status = d[0].trim().split(' ')[0].trim();
                telemetry.ironfish.p2p.active = telemetry.ironfish.p2p.status === 'CONNECTED';
                telemetry.ironfish.p2p.input = isNaN(nin) ? 0.0 : nin;
                telemetry.ironfish.p2p.output = isNaN(nout) ? 0.0 : nout;
                telemetry.ironfish.p2p.peers = peers;
            }
        }
    }
    async parseMining(telemetry, data) {
        if (data) {
            let d = data.split('-');
            telemetry.ironfish.mining.status = d[0].trim();
            telemetry.ironfish.mining.active = telemetry.ironfish.mining.status === 'STARTED';
            if (d[1]) {
                let mm = d[1].trim().split(',').map(x => parseInt(x.trim().split(' ')[0])).filter(x => !isNaN(x));
                if (mm.length === 2) {
                    telemetry.ironfish.mining.miners = mm[0];
                    telemetry.ironfish.mining.mined = mm[1];
                }
            }
        }
    }
    async parseMemPool(telemetry, data) {
        if (data) {
            let dd = data.trim().split(',').map(x => x.trim().split(':')[1]).filter(x => x !== undefined);
            if (dd.length == 2) {
                let c = parseInt(dd[0].trim().split(' ')[0]);
                telemetry.ironfish.mem_pool.count = isNaN(c) ? 0 : c;
                telemetry.ironfish.mem_pool.bytes = toKb(dd[1]);
            }
        }
    }
    async parseSyncer(telemetry, data) {
        if (data) {
            let dd = data.trim().split('-');
            if (dd.length === 2) {
                let speed = parseFloat(dd[1].trim().split(' ')[0]);
                telemetry.ironfish.syncer.status = dd[0].trim();
                telemetry.ironfish.syncer.idle = telemetry.ironfish.syncer.status === 'IDLE';
                telemetry.ironfish.syncer.speed = isNaN(speed) ? 0.0 : speed;
            }
        }
    }
    async parseBlockchain(telemetry, data) {
        if (data) {
            let dd = data.split(',');
            if (dd.length === 2) {
                let s = dd[1].trim().split(':')[1];
                if (s) {
                    let t = parseSeconds(s.split('(')[0].trim());
                    let status = (s.split('(')[1] ?? '').replace(')', '').trim();
                    telemetry.ironfish.blockchain.status = status;
                    telemetry.ironfish.blockchain.synced = telemetry.ironfish.blockchain.status === 'SYNCED';
                    telemetry.ironfish.blockchain.since_head = t;
                }
            }
        }
    }
    async parseWorkers(telemetry, data) {
        if (data) {
            let wps = parseFloat(data.split(',').reverse()[0].trim().split(' ')[0]);
            telemetry.ironfish.workers.status = data.split('-')[0].trim();
            telemetry.ironfish.workers.active = telemetry.ironfish.workers.status === 'STARTED';
            telemetry.ironfish.workers.jobs_per_second = isNaN(wps) ? 0.0 : wps;
        }
    }
    async parse(telemetry, input) {
        if (input) {
            let lines = this.getLines(input);
            if (lines && lines.length) {
                lines = lines.map(x => x.trim());
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
                    }
                    catch (err) {
                        console.log(`Unable to parse IRONFISH ${n} output, ${err}`);
                    }
                }
            }
        }
    }
}
exports.IronfishStatus = IronfishStatus;
class IronfishAccountBalance extends Command {
    constructor() {
        super('ironfish.wallet.balance', 'ironfish wallet:balance');
    }
    async parse(telemetry, input) {
        if (input) {
            let lines = this.getLines(input).slice(1);
            if (lines && lines.length) {
                let l = lines[0].split('IRON ');
                if (l.length > 1) {
                    let b = Number.parseFloat(String(l[l.length - 1]));
                    if (!isNaN(b)) {
                        telemetry.ironfish.wallet.balance = b;
                    }
                }
            }
        }
    }
}
exports.IronfishAccountBalance = IronfishAccountBalance;
const testOutput = {
    'mpstat -P ALL': `Linux 5.10.0-21-amd64 (ironfish)        03/08/2023      _x86_64_        (4 CPU)

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
};
//# sourceMappingURL=command.js.map