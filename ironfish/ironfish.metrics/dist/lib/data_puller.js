"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.puller = void 0;
const command_1 = require("./command");
const data_1 = require("./data");
const metrics_1 = require("./metrics");
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
    let data = new data_1.TelemetryData();
    for (let cmd of commands) {
        try {
            let cmdData = await cmd.exec();
            data.assign(cmdData);
        }
        catch (err) {
            console.log(`Error on executing command '${cmd}'`);
        }
    }
    try {
        exports.puller.data = data;
        exports.puller.json = JSON.stringify(data, null, 4);
    }
    catch (err) {
    }
    try {
        exports.puller.metrics = await metrics_1.metricGenerator.getMetrics(data);
    }
    catch (err) {
    }
    console.log(exports.puller.json);
    console.log(exports.puller.metrics);
    let s = "";
}
const commands = [
    new command_1.DfCommand(),
    new command_1.MpstatCommand(),
    new command_1.FreeCommand(),
    new command_1.IfstatCommand(),
    new command_1.IronfishStatus(),
    new command_1.IronfishAccountBalance()
];
function registerEndpoints(app) {
    for (let c of commands) {
        app.get('/output/' + c.name, async (req, res) => {
            res.setHeader('content-type', 'text/plain');
            res.send(JSON.stringify(c.exec(), null, 4));
        });
    }
}
class DataPuller {
    data;
    json;
    metrics;
    stop() {
        exiting = true;
        clearTimer();
    }
    start(express) {
        setupTimer();
        if (express) {
            registerEndpoints(express);
        }
    }
}
exports.puller = new DataPuller();
//# sourceMappingURL=data_puller.js.map