import { Injectable } from "@piros/ioc";

import { AppSecurityService } from "./app-security-service";
import { AppSessionsService } from "./app-sessions-service";
import { ExpressAppService } from "./express-app-service";
import { SessionData } from "./SessionData";

@Injectable
export class RequestManagerService {

    private postMappings: Map<string, (body: any, session?: SessionData) => Promise<any>> = new Map();

    constructor(
        private sessionsService: AppSessionsService,
        private securityService: AppSecurityService,
        private expressAppService: ExpressAppService
    ) {

    }

    public registerPost(name: string, method: (body: any) => Promise<any>) {
        this.postMappings.set(name, method);
    }

    public registerAppPostRequestMappings() {
        this.postMappings.forEach((method, path) => {
            this.expressAppService.post('/' + path, (req, res) => {
                if (req.headers && req.headers.authorization) {
                    const token = req.headers.authorization;
                    this.sessionsService.getByToken(token).then(session => {
                        this.callMethod(method, path, req, res, session);
                    });
                } else {
                    this.callMethod(method, path, req, res, null);
                }
            });
        });
    }

    private callMethod(method: (body: any, session?: SessionData) => Promise<any>, path: string, req: any, res: any, session: SessionData) {
        const request = path;
        this.securityService.canSessionMakeRequest(session, request).then((canMakeRequest) => {
            if (canMakeRequest) {
                this.makeRequest(method, req, session, res);
            } else {
                res.status(401);
                res.json({ httpStatusCode: 401, description: 'Unauthorized' });
            }
        });
    }

    private makeRequest(method: (body: any, session?: SessionData) => Promise<any>, req: any, session: SessionData, res: any) {
        method(req.body, session)
            .then(result => {
                res.json(result);
            })
            .catch(err => {
                if (err.status) {
                    res.status(err.status);
                }
                else {
                    res.status(500);
                }

                res.json(err);
            });
    }
}