import {  BpmnElementOptions } from './index'
import {descriptorFunction} from './aop'

export function BpmnElement(options: BpmnElementOptions): DecoratorFunction {

    /**
     * target: The prototype of the class (Object)
     * propertyKey: The name of the method (string | symbol).
     * descriptor: A TypedPropertyDescriptor — see the type, leveraging the Object.defineProperty under the hood.
     *
     * NOTE: It's very important here we do not use arrow function otherwise 'this' will be messed up due
     * to the nature how arrow function defines this inside.
     *
     */
    return function (target: Record<string, any>, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

        const originalFunc = descriptor.value;

        descriptor.value = descriptorFunction(originalFunc, options)

        return descriptor;
    }
}

export type DecoratorFunction = (target: Record<string, any>, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;