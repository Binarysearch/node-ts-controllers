import { Injectable } from "@piros/ioc";
import { SessionData } from "./SessionData";

export interface AuthorizationResponseDto { 
    authorized: boolean; 
    session: SessionData; 
}

@Injectable
export class AppSecurityService {

    constructor() {

    }

    public canUserWithSessionTokenMakeRequest(token: any, path: string): Promise<AuthorizationResponseDto> {
        return Promise.resolve({
            session: null,
            authorized: true
        });
    }

    public canSessionMakeRequest(session: SessionData, request: string): Promise<boolean> {
        return Promise.resolve(true);
    }
}