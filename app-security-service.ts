import { Injectable } from "@piros/ioc";
import { SessionData } from "./SessionData";

@Injectable
export class AppSecurityService {

    constructor() {

    }

    public canSessionMakeRequest(session: SessionData, request: string): Promise<boolean> {
        return Promise.resolve(true);
    }
}