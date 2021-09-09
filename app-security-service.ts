import { Injectable } from "@piros/ioc";
import { SessionData, AuthorizationResponseDto } from ".";


@Injectable
export class AppSecurityService {

    constructor() {

    }

    public canUserWithSessionTokenMakeRequest(token: string, path: string): Promise<AuthorizationResponseDto> {
        return Promise.resolve({
            session: null,
            authorized: true
        });
    }

    public canSessionMakeRequest(session: SessionData, request: string): Promise<boolean> {
        return Promise.resolve(true);
    }
}