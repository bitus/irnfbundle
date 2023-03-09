import { DfCommand, FreeCommand, IfstatCommand, IronfishAccountBalance, IronfishStatus, MpstatCommand } from "./command";
import { TelemetryData } from "./data";
import { metricGenerator } from "./metrics";

var timer: NodeJS.Timeout = null;
var timeout: number = 15 * 1000;
var exiting: boolean = false;

//const metricsFormatter =

function setupTimer() {
    clearTimer();
    if (!exiting) {
        timer = setTimeout(collectMetrics, timeout);
    } else {
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

function appendMetrics(data:any, toAppend:any):any {
    if (data && toAppend) {
        for(let n of Object.keys(toAppend)) {
            data[n] = toAppend[n];
        }
    }

    return data;
}

async function getMetrics() {
    console.log('Getting metrics');
    let data = new TelemetryData();

    for(let cmd of commands) {
        try {
            let cmdData = await cmd.exec(data);
            data = appendMetrics(data, cmdData);
        }
        catch (err) {
            console.log(`Error on executing command '${cmd}'`);
        }
    }


    try {
        puller.data = data;
        puller.json = JSON.stringify(data, null, 4);
    }
    catch (err) {

    }

    try {
        puller.metrics = await metricGenerator.getMetrics(data);
    }
    catch(err) {

    }

    console.log(puller.json);
    console.log(puller.metrics);

    let s = "";
}

const commands = [
    new DfCommand(),
    new MpstatCommand(),
    new FreeCommand(),
    new IfstatCommand(),
    new IronfishStatus(),
    new IronfishAccountBalance()
];

class DataPuller {
    data:any;
    json:string;
    metrics:string;

    stop() {
        exiting = true;
        clearTimer();
    }

    start() {
        setupTimer();
    }
}


export const puller = new DataPuller();