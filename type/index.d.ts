export declare type Root = HTMLElement;
export declare type direction = 'horizontal' | 'vertical';
export declare type effect = 'slide' | 'fade';
export declare type timer = null | number;
export interface Options {
    root: Root;
    direction?: direction;
    loop?: boolean;
    effect?: effect;
    disabledHand?: boolean;
    index?: number;
    scaleValue?: number;
    slideChange?: (index: number) => void;
}
