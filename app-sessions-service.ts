import { Injectable } from "@piros/ioc";
import { SessionsDao } from "./dao/sessions-dao";
import { SessionData } from "./SessionData";

@Injectable
export class AppSessionsService {

    constructor(
        private sessionsDao: SessionsDao
    ) {}

    public getByToken(token: string): Promise<SessionData> {
        return this.sessionsDao.getSessionDataByToken(token);
    }
}