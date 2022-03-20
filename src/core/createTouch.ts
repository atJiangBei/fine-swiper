type Root = HTMLElement | Document;
//start
type StartCallbackArguments = {
  startX: number;
  startY: number;
  event: MouseEvent | TouchEvent;
};
type StartCallback = {
  (arg: StartCallbackArguments): void;
};
//moveing
export type MoveCallbackArguments = {
  movedX: number;
  movedY: number;
  stepX: number;
  stepY: number;
  event: MouseEvent | TouchEvent;
};
type MoveCallback = {
  (arg: MoveCallbackArguments): void;
};
//end
export type EndCallbackArguments = {
  movedX: number;
  movedY: number;
  speedX: number;
  speedY: number;
  event?: MouseEvent | TouchEvent;
};
type EndCallback = {
  (arg: EndCallbackArguments): void;
};
//option
type Option = {
  root: Root;
  startCallback?: StartCallback;
  moveCallback?: MoveCallback;
  endCallback?: EndCallback;
};

type Callback = {
  (e: MouseEvent | TouchEvent): void;
};
const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent =>
  e instanceof TouchEvent;

function registerStart(root: Root, callback: Callback) {
  root.addEventListener('touchstart', callback as any);
  root.addEventListener('mousedown', callback as any);
}
function registerMove(root: Root, callback: Callback) {
  document.addEventListener('touchmove', callback as any);
  document.addEventListener('mousemove', callback as any);
}
function registerEnd(root: Root, callback: Callback) {
  document.addEventListener('touchend', callback as any);
  document.addEventListener('touchcancel', callback as any);
  document.addEventListener('mouseup', callback as any);
}
function destroyStart(root: Root, callback: Callback) {
  root.removeEventListener('touchstart', callback as any);
  root.removeEventListener('mousedown', callback as any);
}
function destroyMove(root: Root, callback: Callback) {
  document.removeEventListener('touchmove', callback as any);
  document.removeEventListener('mousemove', callback as any);
}
function destroyEnd(root: Root, callback: Callback) {
  document.removeEventListener('touchend', callback as any);
  document.removeEventListener('touchcancel', callback as any);
  document.removeEventListener('mouseup', callback as any);
}
export class FineTouch {
  root: Root;
  hasMove: boolean;
  isStart: boolean;
  startMethod: Callback;
  moveMethod: Callback;
  endMethod: Callback;
  constructor(option: Option) {
    const {
      root,
      moveCallback = () => {},
      startCallback = () => {},
      endCallback = () => {},
    } = option;
    this.hasMove = true;
    this.isStart = false;
    this.root = root;
    const positions: Array<MouseEvent | TouchEvent> = [];
    let lastTimeStamp: number = 0;
    let stepX: number = 0;
    let stepY: number = 0;
    let startX: number = 0;
    let startY: number = 0;
    this.startMethod = (e) => {
      this.hasMove = false;
      this.isStart = true;
      if (e.type === 'mousedown') {
        //On the PC side, default events are disabled in MouseDown events
        //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
        //360 Browser
        e.preventDefault();
      }
      const currentTouch = isTouchEvent(e) ? e.touches[0] : e;
      const { clientX, clientY } = currentTouch;
      startX = clientX;
      startY = clientY;
      stepX = clientX;
      stepY = clientY;
      lastTimeStamp = e.timeStamp;
      startCallback({
        startX: clientX,
        startY: clientY,
        event: e,
      });
    };
    this.moveMethod = (e) => {
      this.hasMove = true;
      if (!this.isStart) return;
      const currentTouch = isTouchEvent(e) ? e.touches[0] : e;
      const { clientX, clientY } = currentTouch;
      moveCallback({
        movedX: clientX - startX,
        movedY: clientY - startY,
        stepX: clientX - stepX,
        stepY: clientY - stepY,
        event: e,
      });
      stepX = clientX;
      stepY = clientY;
      if (positions.length > 20) {
        positions.splice(0, 10);
      }
      positions.push(e);
      lastTimeStamp = e.timeStamp;
    };
    this.endMethod = (e) => {
      if (!this.isStart) return;

      this.isStart = false;
      if (!this.hasMove) {
        this.hasMove = true;
        return;
      }
      let speedX = 0;
      let speedY = 0;
      if (e.timeStamp - lastTimeStamp <= 100) {
        const endPos = positions.length - 1;
        let startPos = endPos;
        for (let i = endPos; i >= 0; i--) {
          const touch = positions[i];
          if (touch.timeStamp + 100 > lastTimeStamp) {
            startPos = i;
          }
        }
        if (startPos !== endPos) {
          const timeOffset =
            positions[endPos].timeStamp - positions[startPos].timeStamp;
          const targetEvent = positions[startPos];
          const currentTouch = isTouchEvent(targetEvent)
            ? targetEvent.touches[0]
            : targetEvent;
          const { clientX, clientY } = currentTouch;
          const movedX = stepX - clientX;
          const movedY = stepY - clientY;
          speedX = (movedX / timeOffset) * (1000 / 60);
          speedY = (movedY / timeOffset) * (1000 / 60);
        }
      }

      const currentTouch = isTouchEvent(e) ? e.changedTouches[0] : e;
      const { clientX, clientY } = currentTouch;

      endCallback({
        movedX: clientX - startX,
        movedY: clientY - startY,
        speedX,
        speedY,
        event: e,
      });
      stepX = 0;
      stepY = 0;
      startX = 0;
      startY = 0;
      lastTimeStamp = 0;
      positions.length = 0;
    };
    registerStart(root, this.startMethod);
    registerMove(root, this.moveMethod);
    registerEnd(root, this.endMethod);
  }
  destroy() {
    destroyStart(this.root, this.startMethod);
    destroyMove(this.root, this.moveMethod);
    destroyEnd(this.root, this.endMethod);
  }
}

const createTouch = (option: Option): FineTouch => {
  return new FineTouch(option);
};

export default createTouch;
