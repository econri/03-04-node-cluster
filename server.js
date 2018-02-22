'use strict';

const cluster = require('cluster');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const numCPUs = require('os').cpus().length;
const clientFilePath = path.join(__dirname, './client.html');

if (cluster.isMaster) {
  console.log(`Master ${ process.pid } is running`);

  // Запускаем worker-ы
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${ worker.process.pid } died`);
  });
} else {
  http.createServer((req, res) => {
    console.log(`Worker ${ cluster.worker.process.pid }: request`);
    
    res.writeHead(200);

    fs
      .createReadStream(clientFilePath)
      .pipe(res);
  }).listen(PORT);

  console.log(`Worker ${ process.pid } started`);
}