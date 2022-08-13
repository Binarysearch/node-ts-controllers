import 'reflect-metadata';
import { Type, Injector } from "@piros/ioc";
import { RequestManagerService } from "./request-manager-service";
import { POST_MAPPINGS } from "./controller";
import { ExpressAppService } from './express-app-service';
import { AppInstallerInterceptor, InstallationStatus } from './app-installer-interceptor';



export interface ApplicationConfig {
    controllers: Type<any>[]
}

export class Application {

    private controllers: Map<Object, any> = new Map();

    constructor(config: ApplicationConfig, private injector: Injector) {

        config.controllers.forEach((controller) => {
            const params: Type<any>[] = Reflect.getOwnMetadata('design:paramtypes', controller);

            if (!params || params.length === 0) {
                this.controllers.set(controller.prototype, new controller());
            } else if (params.length === 1) {
                this.controllers.set(controller.prototype, new controller(injector.resolve(params[0])));
            } else {
                this.controllers.set(controller.prototype, new controller(...(params.map(dep => this.injector.resolve(dep)))));
            }
        });
    }

    public async close(): Promise<void> {
        const expressAppService: ExpressAppService = this.injector.resolve(ExpressAppService);
        return expressAppService.close();
    }

    public start(port: number, cb?: () => void): void {
        const appInstallerService: AppInstallerInterceptor = this.injector.resolve(AppInstallerInterceptor);
        const expressAppService: ExpressAppService = this.injector.resolve(ExpressAppService);
        const requestManagerService: RequestManagerService = this.injector.resolve(RequestManagerService);

        POST_MAPPINGS.forEach((m) => {
            const target = this.controllers.get(m.controller);
            const method = m.method.bind(target);
            requestManagerService.registerPost(m.path, method);
        });

        expressAppService.app.use((req, res, next) => {
            appInstallerService.getInstallationStatus().then(installationStatus => {
                if (installationStatus == InstallationStatus.NOT_INSTALLED) {
                    appInstallerService.onNotInstalledStatus(req, res, next);
                } else if (installationStatus == InstallationStatus.UNKNOWN) {
                    appInstallerService.onUnknownStatus(req, res, next);
                } else {
                    next();
                }
            });
        });

        requestManagerService.registerAppPostRequestMappings();

        expressAppService.listen(port, cb);
    }
}