"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_puller_1 = require("./lib/data_puller");
process.stdin.resume();
function exitHandler(options, exitCode) {
    data_puller_1.puller.stop();
    if (options.exit)
        process.exit();
}
process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
const app = (0, express_1.default)();
const port = 8765;
const host = '0.0.0.0';
app.get('/', (req, res) => {
    res.send('');
});
app.get('/metrics', (req, res) => {
    let metrics = data_puller_1.puller.metrics ?? '';
    res.setHeader('content-type', 'text/plain');
    res.send(metrics);
});
app.get('/data', (req, res) => {
    let data = {};
    if (data_puller_1.puller.json) {
        data = JSON.parse(data_puller_1.puller.json ?? '{}');
    }
    res.json(data);
});
app.get('/json', (req, res) => {
    let json = data_puller_1.puller.json ?? '';
    res.setHeader('content-type', 'application/json');
    res.send(json);
});
app.listen(port, host, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
});
data_puller_1.puller.start(app);
//# sourceMappingURL=index.js.map