import { Injectable } from "@piros/ioc";

import express = require('express');
import * as http from 'http';

@Injectable
export class ExpressAppService {

    private _app: express.Application;
    private _server: http.Server;


    constructor(){
        this._app = express();
        this._app.use(express.json({ strict: false, limit: '10mb' }));
        this._app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            next();
        });
        
        this._server = http.createServer(this._app);
    }

    public listen(port: number, cb?: () => void) {
        this._server.listen(port, cb);
    }

    public async close(): Promise<void> {
        return new Promise(resolve => {
            this._server.close(() => {
                console.log('Server closed.');
                resolve();
            });
        });
    }

    public post(path: string, handler: (req: any, res: any) => void) {
        this._app.post(path, handler);
    }

    public get app(): express.Application {
        return this._app;
    }

    public get server(): http.Server {
        return this._server;
    }
}