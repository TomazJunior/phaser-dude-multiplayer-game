import RoomManager from './roomManager';
import { Request, Response, Router } from 'express';
import path from 'path';
export default class Routes {
  router: Router;
  constructor(public roomManager: RoomManager) {
    this.router = Router();

    this.router.get('/', (req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'index.html'));
    });
  }
}
