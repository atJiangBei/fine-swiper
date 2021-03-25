import Swiper from './swiper';
import { Options, timer } from './../type/index';
declare class FineSlideSwiper extends Swiper {
    private speed;
    private _start;
    private _move;
    private _end;
    constructor(props: Options);
    _visibilitychange(): void;
    private isLoop;
    private initSetIndex;
    setInterval(): timer;
    private start;
    private move;
    end(ev: any): void;
    private slideProcess;
    private numericalConversion;
    moveTo(index: number): void;
    private aotoplay;
    private slideMove;
    destroy(): void;
}
export default FineSlideSwiper;
