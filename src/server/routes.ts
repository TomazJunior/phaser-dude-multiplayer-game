import RoomManager from './roomManager';
import { Request, Response, Router } from 'express';
import path from 'path';
import pidusage from 'pidusage';

export default class Routes {
  router: Router;
  constructor(public roomManager: RoomManager) {
    this.router = Router();

    this.router.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'index.html'));
    });

    this.router.get('/details', (req, res) => {
      pidusage(process.pid, (err, stats) => {
        if (err) return res.status(500).json({ err: err });
        // console.log('stats', stats);
        const payload = {
          ...stats,
          rooms: roomManager.getRooms(),
        };
        res.json({ payload });
      });
      // res.json({ rooms: roomManager.getRooms() });
    });
  }
}
