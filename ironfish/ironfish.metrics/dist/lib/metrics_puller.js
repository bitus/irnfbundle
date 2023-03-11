"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.puller = void 0;
const command_1 = require("./command");
var timer = null;
var timeout = 15 * 1000;
var exiting = false;
function setupTimer() {
    clearTimer();
    if (!exiting) {
        timer = setTimeout(collectMetrics, timeout);
    }
    else {
    }
}
function clearTimer() {
    if (timer !== null) {
        clearTimeout(timer);
        timer = null;
    }
}
async function collectMetrics() {
    try {
        clearTimer();
        await getMetrics();
    }
    catch (err) {
        console.log(`Error on collecting metrics. ${err}`);
    }
    finally {
        setupTimer();
    }
}
function appendMetrics(data, toAppend) {
    if (data && toAppend) {
        for (let n of Object.keys(toAppend)) {
            data[n] = toAppend[n];
        }
    }
    return data;
}
async function getMetrics() {
    console.log('Getting metrics');
    let data = {};
    for (let cmd of commands) {
        try {
            let cmdData = await cmd.exec();
            data = appendMetrics(data, cmdData);
        }
        catch (err) {
            console.log(`Error on executing command '${cmd}'`);
        }
    }
    console.log(data);
}
const commands = [
    new command_1.DfCommand(),
    new command_1.MpstatCommand(),
    new command_1.FreeCommand(),
    new command_1.IfstatCommand(),
    new command_1.IronfishStatus(),
    new command_1.IronfishAccountBalance()
];
class MetricPuller {
    stop() {
        exiting = true;
        clearTimer();
    }
    start() {
        setupTimer();
    }
}
exports.puller = new MetricPuller();
//# sourceMappingURL=metrics_puller.js.map