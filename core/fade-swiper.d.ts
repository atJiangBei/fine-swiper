import Swiper from './swiper';
import { Options, timer } from './../type/index';
declare class FineFideSwiper extends Swiper {
    private _start;
    private _move;
    private _end;
    constructor(props: Options);
    _visibilitychange(): void;
    setInterval(): timer;
    private initSetIndex;
    private ifEffectFade;
    private start;
    private move;
    private end;
    moveTo(index: number): void;
    private fadeMove;
    private aotoplay;
    private fadeProcess;
    private fadeSetIndex;
    destroy(): void;
}
export default FineFideSwiper;
