import 'reflect-metadata';
import { Type, Injector } from "@piros/ioc";
import { RequestManagerService } from "./request-manager-service";
import { POST_MAPPINGS } from "./controller";
import { ExpressAppService } from './express-app-service';



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
                this.controllers.set(controller.prototype, new controller(...(params.map(dep => this.injector.resolve(dep)) )));
            }
        });
    }
    
    public start(port: number): void {
        const expressAppService: ExpressAppService = this.injector.resolve(ExpressAppService);
        const requestManagerService: RequestManagerService = this.injector.resolve(RequestManagerService);
        
        POST_MAPPINGS.forEach((m) => {
            const target = this.controllers.get(m.controller);
            const method = m.method.bind(target);
            requestManagerService.registerPost(m.path, method);
        });
        
        requestManagerService.registerAppPostRequestMappings();

        expressAppService.listen(port);
    }
}