type Root = HTMLDivElement;
type Option = {
  root: Root;
};

type Callback = {
  (e: Event): void;
};
function registerStart(root: Root, callback: Callback) {
  root.addEventListener('touchstart', callback);
  root.addEventListener('mosedown', callback);
}
function registerMove(root: Root, callback: Callback) {
  document.addEventListener('touchmove', callback);
  document.addEventListener('mosemove', callback);
}
function registerEnd(root: Root, callback: Callback) {
  document.addEventListener('touchend', callback);
  document.addEventListener('touchcancel', callback);
  document.addEventListener('moseup', callback);
}
class FineTouch {
  public hasMove: boolean;
  public isStart: boolean;
  constructor(option: Option) {
    const { root } = option;
    this.hasMove = true;
    this.isStart = false;
    registerStart(root, (e: Event) => {
      this.hasMove = false;
      this.isStart = true;
    });
    registerMove(root, (e: Event) => {
      this.hasMove = true;
    });
    registerEnd(root, (e: Event) => {
      if (!this.isStart) return
      this.isStart = false
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

