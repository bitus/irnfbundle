
import express from "express";
import { puller } from "./lib/data_puller";

//const { exec } = require('node:child_process')


process.stdin.resume();

function exitHandler(options, exitCode) {
  puller.stop();

  //if (options.cleanup) console.log('clean');
  //if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}


process.on('exit', exitHandler.bind(null,{cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

const app = express();
//const port = process.env.PORT || 8765;
const port = 8765;
const host = '0.0.0.0';

app.get('/', (req, res) => {
  res.send('');
});

app.get('/metrics', (req, res) => {
  let metrics = puller.metrics ?? '';
  res.setHeader('content-type', 'text/plain');
  res.send(metrics);
});

app.get('/data', (req, res) => {
  let data = {};
  if (puller.json) {
    data = JSON.parse(puller.json ?? '{}');
  }

  res.json(data);
});

app.get('/json', (req, res) => {
  let json = puller.json ?? '';
  res.setHeader('content-type', 'application/json');
  res.send(json);
});

app.listen(port, host, () => {
  console.log(`[server]: Server is running at http://${host}:${port}`);
});

puller.start();