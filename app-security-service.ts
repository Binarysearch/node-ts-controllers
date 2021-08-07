import { Injectable } from "@piros/ioc";
import { AVAILABLE_PERMISSIONS } from "../lib";
import { DatabaseService } from "./dao/database-service";
import { SessionData } from "./SessionData";

@Injectable
export class AppSecurityService {

    constructor(
        private databaseService: DatabaseService
    ) {

    }

    public canSessionMakeRequest(session: SessionData, request: string): Promise<boolean> {
        const notRequireSessionRequests = new Set(['login', 'get-session-data', 'delete-session']);

        const adminRequests = new Set([
            'create-user',
            'set-user-active',
            'get-logs',
            'update-user',
            'exists-user-by-username',
            'exists-user-by-movil',
            'exists-user-by-email',
            'get-users',
            'create-role',
            'get-role',
            'get-roles',
            'update-role',
            'delete-role',
            'delete-user',
            'create-database-backup',
            'restore-database-backup',
            'get-database-backups',
            'add-role-to-users',
            'remove-role-from-users',
            'get-user-roles',
            'set-user-roles',
            'get-users-with-role',
            'set-email-server-config',
            'get-email-server-config',
            'set-recover-email-password-template',
            'get-recover-email-password-template',
        ]);
        
        if (notRequireSessionRequests.has(request)) {
            return Promise.resolve(true);
        }

        if (session && session.user) {
            if (session.user.admin) {
                return Promise.resolve(true);
            } else {
                if (adminRequests.has(request)) {
                    return Promise.resolve(false);
                } else {
                    return this.canUserMakeRequest(session.user.id, request);
                }
            }
        }
        
        return Promise.resolve(false);
    }
    
    private async canUserMakeRequest(userId: string, request: string): Promise<boolean> {
        const permissions = this.getPermissionsThatCanMakeRequest(request);
        if (permissions.length == 0) {
            return false;
        }

        const permissionPlaceholders = permissions.map((p, i) => `$${i + 1}`).join(',');
        return await this.databaseService.getOne<{ exists: boolean; }>(`
            select exists(
                select 1 from core.user_roles ur join core.roles r on r.id = ur.role and 
                r.permissions ?| array[${permissionPlaceholders}] 
                and ur."user" = $${permissions.length + 1}
            );
        `, [ ...permissions, userId ]).then(row => row.exists);
    }
    
    private getPermissionsThatCanMakeRequest(request: string): string[] {
        return AVAILABLE_PERMISSIONS.filter(p => p.grantedRequests.has(request)).map(p => p.id);
    }
}