import { SessionData } from ".";

export interface AuthorizationResponseDto { 
    authorized: boolean; 
    session: SessionData; 
}