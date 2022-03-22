declare type Root = HTMLElement | Document;
declare type StartCallbackArguments = {
    startX: number;
    startY: number;
    event: MouseEvent | TouchEvent;
};
declare type StartCallback = {
    (arg: StartCallbackArguments): void;
};
export declare type MoveCallbackArguments = {
    movedX: number;
    movedY: number;
    stepX: number;
    stepY: number;
    event: MouseEvent | TouchEvent;
};
declare type MoveCallback = {
    (arg: MoveCallbackArguments): void;
};
export declare type EndCallbackArguments = {
    movedX: number;
    movedY: number;
    speedX: number;
    speedY: number;
    event?: MouseEvent | TouchEvent;
};
declare type EndCallback = {
    (arg: EndCallbackArguments): void;
};
declare type Option = {
    root: Root;
    startCallback?: StartCallback;
    moveCallback?: MoveCallback;
    endCallback?: EndCallback;
};
declare type Callback = {
    (e: MouseEvent | TouchEvent): void;
};
export declare class FineTouch {
    root: Root;
    hasMove: boolean;
    isStart: boolean;
    startMethod: Callback;
    moveMethod: Callback;
    endMethod: Callback;
    constructor(option: Option);
    destroy(): void;
}
declare const createTouch: (option: Option) => FineTouch;
export default createTouch;
