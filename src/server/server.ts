import * as express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import path from 'path';
import PhaserGame from './game/game';
import http from 'http';

const app = express.default();
const server = http.createServer(app);
new PhaserGame(server);

const { PORT = 3000 } = process.env;

app.use(cors());

app.use(express.static(path.join(process.cwd(), 'build/client')));

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

server.listen(PORT, () => {
  console.log('server started at http://localhost:' + PORT);
});
