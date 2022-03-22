import { direction, Options, Root } from './../type/index';
import { MoveCallbackArguments, EndCallbackArguments, FineTouch } from './createTouch';
declare class Slide {
    options: Options;
    root: Root;
    index: number;
    direction: direction;
    loop: boolean;
    disabledHandSlideing: boolean;
    slideContainer: HTMLElement;
    slideList: HTMLCollection;
    scaleValue: number;
    size: number;
    slideDistance: number;
    length: number;
    animateId: number;
    maxSlideDistance: number;
    animateSped: number;
    slideChange: (index: number) => void;
    touchInstance: FineTouch;
    constructor(options: Options);
    init(): void;
    resize(): void;
    reinitialize(): void;
    destroy(): void;
    setAnimateSped(): void;
    rePlanningElements(): void;
    setSlideDistanceByStep(arg: MoveCallbackArguments): void;
    setSlideDistanceByIndex(): void;
    setTranslate(): void;
    __toNextCycle(arg: EndCallbackArguments): void;
    __getNextCriticalValue(movedDistance: number): number;
    __getPrevCriticalValue(movedDistance: number): number;
    toPrevPage(): void;
    toNextPage(): void;
    toPage(page: number): void;
    setIndexBySlideDistance(): void;
    rescheduleSlidingDistance(): void;
    getSize(): number;
    getMaxSlideDistance(): number;
    getSlideContentSize(): number;
    startAnimation(nowDistance: number, targetDistance: number, speed: number | any, cb: Function): Promise<unknown>;
    cancelAnimation(): void;
}
declare const createSlide: (options: Options) => Slide;
export default createSlide;
