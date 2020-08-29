import geckos, { GeckosServer, iceServers } from '@geckos.io/server';
import cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';
import http from 'http';
import path from 'path';

import RoomManager from './roomManager';
import Routes from './routes';

const app = express.default();
const server = http.createServer(app);
const { PORT = 3000 } = process.env;

console.log('process.env.NODE_ENV', process.env.NODE_ENV);
const io: GeckosServer = geckos({
  iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
});
io.addServer(server);

const roomManager = new RoomManager(io);

app.use(cors());

app.use(express.static(path.join(process.cwd(), 'build/client')));

app.use('/', new Routes(roomManager).router);

app.use('/details', (req, res) => {
  res.json(roomManager.getRooms());
});

server.listen(PORT, () => {
  console.log('server started at http://localhost:' + PORT);
});
