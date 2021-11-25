type Root = HTMLDivElement;
type Option = {
  root: Root;
};

type Callback = {
  (e: Event | TouchEvent): void;
};
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
export class FineTouch {
  public hasMove: boolean;
  public isStart: boolean;
  constructor(option: Option) {
    const { root } = option;
    this.hasMove = true;
    this.isStart = false;
    registerStart(root, (e) => {
      this.hasMove = false;
      this.isStart = true;
      if (e.type === 'mousedown') {
        //On the PC side, default events are disabled in MouseDown events
        //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
        //360 Browser
        e.preventDefault();
      }
      const target = e.touches ? e.touches[0] : e;
    });
    registerMove(root, (e: Event) => {
      this.hasMove = true;
    });
    registerEnd(root, (e: Event) => {
      if (!this.isStart) return;
      this.isStart = false;
      if (!this.hasMove) {
        this.hasMove = true;
        return;
      }
    });
  }
}

const createTouch = (option: Option): FineTouch => {
  return new FineTouch(option);
};

export default createTouch;
