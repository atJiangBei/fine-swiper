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
class Touch {
  public hasMove: boolean;
  constructor(option: Option) {
    const { root } = option;
    this.hasMove = true;
    registerStart(root, (e: Event) => {
      this.hasMove = false;
    });
    registerMove(root, (e: Event) => {
      this.hasMove = true;
    });
    registerEnd(root, (e: Event) => {
      if (!this.hasMove) {
        this.hasMove = true;
        return;
      }
    });
  }
}

const createTouch = (option: Option): Touch => {
  return new Touch(option);
};

export default createTouch;

createTouch({
  root: document.createElement('div'),
});
