declare const _default: {
    createTouch: (option: {
        root: HTMLElement | Document;
        startCallback?: (arg: {
            startX: number;
            startY: number;
            event: MouseEvent | TouchEvent;
        }) => void;
        moveCallback?: (arg: {
            movedX: number;
            movedY: number;
            stepX: number;
            stepY: number;
            event: MouseEvent | TouchEvent;
        }) => void;
        endCallback?: (arg: {
            event: MouseEvent | TouchEvent;
            speedX: number;
            speedY: number;
        }) => void;
    }) => import("./createTouch").FineTouch;
};
export default _default;
