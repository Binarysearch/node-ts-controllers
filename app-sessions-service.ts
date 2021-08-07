import { Injectable } from "@piros/ioc";
import { SessionData } from "./SessionData";

@Injectable
export class AppSessionsService {

    constructor() {}

    public getByToken(token: string): Promise<SessionData> {
        return Promise.resolve(null);
    }
}