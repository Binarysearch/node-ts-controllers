export interface SessionData {

    token: string;
    user: { 
        id: string;
        username: string;
        admin: boolean;
    };

}