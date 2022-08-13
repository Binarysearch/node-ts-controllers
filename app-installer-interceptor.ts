import { Injectable } from "@piros/ioc";
import { Request, ParamsDictionary, Response, NextFunction } from "express-serve-static-core";
import { ParsedQs } from "qs";


export enum InstallationStatus {
    UNKNOWN = 0,
    INSTALLED = 1,
    NOT_INSTALLED = 2,
}

@Injectable
export class AppInstallerInterceptor {

    public getInstallationStatus(): Promise<InstallationStatus> {
        return Promise.resolve(InstallationStatus.INSTALLED);
    }

    public onNotInstalledStatus(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: NextFunction) {
        res.status(418);
        res.end();
    }

    public onUnknownStatus(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>, next: NextFunction) {
        next();
    }
}