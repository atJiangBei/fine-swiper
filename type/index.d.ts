export declare type direction = 'horizontal' | 'vertical';
export declare type effect = 'slide' | 'fade';
export declare type timer = null | number;
export interface Options {
    root: Element;
    direction: direction;
    loop: boolean;
    auto: boolean;
    delayed: number;
    effect: effect;
    callback: Function;
    enter: Function;
    disabledHand: boolean;
    index: number;
}
