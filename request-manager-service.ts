import { Injectable } from "@piros/ioc";

import { AppSecurityService } from "./app-security-service";
import { ExpressAppService } from "./express-app-service";
import { SessionData } from "./SessionData";

@Injectable
export class RequestManagerService {

    private postMappings: Map<string, (body: any, session?: SessionData) => Promise<any>> = new Map();

    constructor(
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
                const token = req.headers.authorization;
                this.securityService.authorizeRequest(token, path)
                    .then(result => {
                        if (result.authorized) {
                            this.makeRequest(method, req, result.session, res);
                        } else {
                            res.status(401);
                            res.json({ httpStatusCode: 401, description: 'Unauthorized' });
                        }
                    })
                    .catch(error => {
                        if (error.status) {
                            res.status(error.status);
                        } else {
                            res.status(500);
                        }

                        if (error.errorBody) {
                            res.json(error.errorBody);
                        } else {
                            res.json(error);
                        }
                    });
            });
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