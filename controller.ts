import 'reflect-metadata';
import { Type } from '@piros/ioc';

export const POST_MAPPINGS: Map<string, PostMapping> = new Map();

export interface RequestMapping {
    controller: Object;
    name: string;
    method: Function;
}

export interface PostMapping {
    controller: Object;
    path: string;
    method: Function;
}

export function Controller<U extends Type<any>>(constructor: U) {
    return constructor;
}

export function Post(path: string) {
    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {

        const postMapping: PostMapping = {
            controller: target,
            path: path,
            method: descriptor.value
        };

        POST_MAPPINGS.set(path, postMapping);

        return descriptor;
    };
}
