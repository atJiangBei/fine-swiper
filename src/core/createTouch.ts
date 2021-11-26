type Root = HTMLElement | Document;
//start
type StartCallbackArguments = {
  startX: number,
  startY: number,
  event: MouseEvent | TouchEvent
}
type StartCallback = {
  (arg: StartCallbackArguments): void
}
//moveing
type MoveCallbackArguments = {
  movedX: number,
  movedY: number,
  stepX: number,
  stepY: number,
  event: MouseEvent | TouchEvent
}
type MoveCallback = {
  (arg: MoveCallbackArguments): void
}
//end
type EndCallbackArguments = {
  event: MouseEvent | TouchEvent,
  speedX: number,
  speedY: number
}
type EndCallback = {
  (arg: EndCallbackArguments): void
}
//option
type Option = {
  root: Root;
  startCallback?: StartCallback;
  moveCallback?: MoveCallback
  endCallback?: EndCallback
};

type Callback = {
  (e: MouseEvent | TouchEvent): void;
};
const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => e instanceof TouchEvent

function registerStart(root: Root, callback: Callback) {
  root.addEventListener('touchstart', callback);
  root.addEventListener('mousedown', callback);
}
function registerMove(root: Root, callback: Callback) {
  document.addEventListener('touchmove', callback);
  document.addEventListener('mousemove', callback);
}
function registerEnd(root: Root, callback: Callback) {
  document.addEventListener('touchend', callback);
  document.addEventListener('touchcancel', callback);
  document.addEventListener('mouseup', callback);
}
function destroyStart(root: Root, callback: Callback) {
  root.removeEventListener('touchstart', callback);
  root.removeEventListener('mousedown', callback);
}
function destroyMove(root: Root, callback: Callback) {
  document.removeEventListener('touchmove', callback);
  document.removeEventListener('mousemove', callback);
}
function destroyEnd(root: Root, callback: Callback) {
  document.removeEventListener('touchend', callback);
  document.removeEventListener('touchcancel', callback);
  document.removeEventListener('mouseup', callback);
}
export class FineTouch {
  root: Root;
  hasMove: boolean;
  isStart: boolean;
  startMethod: Callback;
  moveMethod: Callback;
  endMethod: Callback;
  constructor(option: Option) {
    const { root, moveCallback = () => { }, startCallback = () => { }, endCallback = () => { } } = option;
    this.hasMove = true;
    this.isStart = false;
    this.root = root;
    const positions: Array<MouseEvent | TouchEvent> = []
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
        event: e
      })
    }
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
        event: e
      })
      stepX = clientX;
      stepY = clientY;
      if (positions.length > 20) {
        positions.splice(0, 10);
      }
      positions.push(e)
    }
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
            startPos = i
          }
        }
        if (startPos !== endPos) {
          const timeOffset = positions[endPos].timeStamp - positions[startPos].timeStamp;
          const targetEvent = positions[startPos];
          const currentTouch = isTouchEvent(targetEvent) ? targetEvent.touches[0] : targetEvent;
          const { clientX, clientY } = currentTouch;
          const movedX = stepX - clientX;
          const movedY = stepY - clientY;
          speedX = movedX / timeOffset * (1000 / 60);
          speedY = movedY / timeOffset * (1000 / 60)
        }
      }

      endCallback({
        event: e,
        speedX,
        speedY
      })
      stepX = 0;
      stepY = 0;
      startX = 0;
      startY = 0;
      lastTimeStamp = 0;
      positions.length = 0
    }
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

const createTouch = (option: Option): void => {
  new FineTouch(option);
};

export default createTouch;

