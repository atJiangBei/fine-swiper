import { direction, effect, timer, Options } from './../type/index';
const scale: number = 50 / 375;
const fadeFloat: number = 0.05;

const time: Function =
  Date.now ||
  function () {
    return +new Date();
  };

class FineSwiper {
  private root: Element;
  private direction: direction;
  private loop: boolean;
  private auto: boolean;
  private delayed: number;
  private effect: effect;
  private startTime: number;
  private callBack: Function;
  private startingPoint: number;
  private isTracking: boolean;
  private captureClick: boolean;
  private disabledHandSlideing: boolean;
  private timer: timer;
  private defaultIndex: number;
  private slider: Element;
  private children: HTMLCollection;
  private length: number;
  private scaleSize: number;
  private index: number;
  private will: boolean;
  private speed: number;
  private scaleWidth: number;
  private scaleHeight: number;
  private _start: (event: Event) => void;
  private _move: (event: Event) => void;
  private _end: (event: Event) => void;
  private _closeDefault: (event: Event) => void;
  constructor(options: Options) {
    this.root = options.root;
    this.direction = options.direction;
    this.loop = options.loop;
    this.auto = options.auto;
    this.delayed = options.delayed;
    this.effect = options.effect;
    this.startTime = 0;
    this.callBack = options.callBack;
    this.startingPoint = 0;
    this.isTracking = false;
    this.captureClick = false;
    this.disabledHandSlideing = !!options.disabledHand;
    this.timer = null;
    this.defaultIndex = this.loop ? -1 : 0;
    this.slider = this.root.children[0];
    this.children = this.slider.children;
    const children: HTMLCollection = this.children;
    this.length = children.length;
    const firstElement: Element = children[0];
    const { width, height } = firstElement.getBoundingClientRect();
    this.scaleWidth = width;
    this.scaleHeight = height;
    const scaleSize = (this.scaleSize =
      this.direction === 'horizontal' ? width : height);
    this.speed = Math.ceil(scale * scaleSize);
    this.initSetIndex(options.index);

    this.initFromEffect(this.effect);

    this.stopDraggable();

    if (this.auto) {
      this.timer = this.setInterval();
    }
    this.will = false;
    this._start = (ev) => {
      this.start(ev);
    };
    this._move = (ev) => {
      this.move(ev);
    };
    this._end = (ev) => {
      this.end(ev);
    };
    this._closeDefault = (ev) => {
      this.closeDefault(ev);
    };
    this.slider.addEventListener('touchstart', this._start, this.will);
    this.slider.addEventListener('touchmove', this._move, this.will);
    this.slider.addEventListener('touchend', this._end, this.will);
    this.slider.addEventListener('touchcancel', this._end, this.will);
    this.slider.addEventListener('mousedown', this._start, this.will);
    this.slider.addEventListener('mousemove', this._move, this.will);
    this.slider.addEventListener('mouseup', this._end, this.will);
    this.slider.addEventListener('click', this._closeDefault, true);
  }
  private closeDefault(ev) {
    const e = ev || event;
    if (this.captureClick) {
      //On the PC side, default events are disabled in MouseDown events
      //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
      e.preventDefault();
      //In the event capture phase,
      //When the mouse slides
      //Prohibit click events to extend inward
      e.stopPropagation();
    }
  }
  private initFromEffect(effect: effect) {
    switch (effect) {
      case 'slide':
        this.ifEffectSlide();
        break;
      case 'fade':
        this.ifEffectFade();
        break;
      default:
        break;
    }
  }
  private ifEffectSlide() {
    const children = this.children;
    const length = this.length;
    if (this.loop) {
      const first: Node = children[0].cloneNode(true);
      const last: Node = children[length - 1].cloneNode(true);
      this.slider.appendChild(first);
      this.slider.insertBefore(last, children[0]);
    }
  }
  private ifEffectFade() {
    const children = this.children;
    const { height } = children[0].getBoundingClientRect();
    const length = this.length;
    for (let i = 0; i < length; i++) {
      children[i]['style'].transform = 'translate3d(0,' + -i * height + 'px,0)';
    }
    this.fadeMove(this.index, 1);
  }
  private initSetIndex(index: number) {
    index = Math.min(Math.abs(index), this.length - 1);
    if (this.effect === 'slide') {
      if (this.loop) {
        this.defaultIndex = -(index + 1);
      } else {
        this.defaultIndex = -index;
      }
      this.slideMove(this.defaultIndex * this.scaleSize);
    }
    this.index = index;
  }
  private stopDraggable(): void {
    //Prohibit dragging pictures while sliding on PC
    const list = this.root.getElementsByTagName('img');
    for (let i = 0; i < list.length; i++) {
      list[i].setAttribute('draggable', 'false');
    }
  }
  private setInterval(): timer {
    return window.setInterval(this.aotoplay.bind(this), this.delayed);
  }
  private clear() {
    window.clearInterval(this.timer);
  }
  private start(ev) {
    const e = ev || event;
    if (e.type === 'mousedown') {
      //On the PC side, default events are disabled in MouseDown events
      //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
      //360 Browser
      e.preventDefault();
    }
    const touches = e.touches;
    const target = touches ? touches[0] : e;
    this.startingPoint =
      this.direction === 'horizontal' ? target.clientX : target.clientY;
    this.startTime = time();
    this.clear();
    this.isTracking = true;
    this.captureClick = false;
    if (this.disabledHandSlideing) return;
  }
  private move(ev) {
    if (!this.isTracking) {
      //Disabled sliding after loosening the mouse
      return;
    }
    const e = ev || event;
    if (e.type === 'mousemove') {
      this.captureClick = true;
    }
    //Default events are prohibited when sliding events occur on the mobile side(For example, click events)
    e.preventDefault();
    if (this.disabledHandSlideing) return;
    const touches = e.changedTouches;
    const target = touches ? touches[0] : e;
    const moved =
      this.direction === 'horizontal'
        ? target.clientX - this.startingPoint
        : target.clientY - this.startingPoint;
    this.clear();

    switch (this.effect) {
      case 'slide':
        this.slideProcess(moved + this.defaultIndex * this.scaleSize, moved);
        break;
      case 'fade':
        const scale = Math.max(0, 1 - Math.abs(moved / this.scaleSize));
        this.fadeProcess(moved, scale);
        break;
      default:
        break;
    }
  }
  private end(ev) {
    if (!this.isTracking) {
      return;
    }
    this.isTracking = false;
    if (this.disabledHandSlideing) return;
    const e = ev || event;
    const touches: Array<object> = e.changedTouches;
    const target = touches ? touches[0] : e;
    let moved: number =
      this.direction === 'horizontal'
        ? target.clientX - this.startingPoint
        : target.clientY - this.startingPoint;
    const duration: number = time() - this.startTime;
    const enter: boolean =
      Math.abs(moved) > this.scaleSize / 2 || duration < 300;
    const scale: number = Math.max(0, 1 - Math.abs(moved / this.scaleSize));
    const loop: boolean = this.loop;
    const oldIndex: number = this.index;
    const length: number = this.length;
    const min: number = this.length - 1;
    const max: number = this.length + 1;
    const speed: number = this.speed;
    if (Math.abs(moved) === 0) {
      return;
    }

    if (this.effect === 'fade') {
      if (enter) {
        const newIndex: number = this.fadeSetIndex(moved);
        const isToNext: number | null = loop ? oldIndex : null;
        this.startMove(1 - scale, 1, fadeFloat, newIndex, isToNext).then(() => {
          if (this.auto) {
            this.clear();
            this.timer = this.setInterval();
          }
        });
      } else {
        let newIndex: number = this.index;
        if (moved < 0) {
          newIndex += 1;
          if (newIndex > min) {
            newIndex = 0;
          }
        } else {
          newIndex -= 1;
          if (newIndex < 0) {
            newIndex = min;
          }
        }
        this.startMove(scale, 1, fadeFloat, this.index, newIndex).then(() => {
          if (this.auto) {
            this.clear();
            this.timer = this.setInterval();
          }
        });
      }
      return;
    }
    if (enter) {
      const oldIndex: number = this.defaultIndex;
      let bufferSpeed: number = speed / 1.6;
      if (moved > 0) {
        if (this.loop) {
          this.defaultIndex += 1;
          if (this.defaultIndex > 0) {
            this.defaultIndex = 0;
          }
          if (oldIndex > 0 && this.defaultIndex > 0) {
            //Solve Occasionally present   bug
            return;
          }
        } else {
          if (this.defaultIndex < 0) {
            this.defaultIndex += 1;
          } else {
            moved /= 3;
            bufferSpeed = 20;
          }
        }
      } else {
        if (this.loop) {
          this.defaultIndex -= 1;
          if (this.defaultIndex <= -max) {
            this.defaultIndex = -max;
            this.slideMove(this.defaultIndex * this.scaleSize);
          }
        } else {
          if (Math.abs(this.defaultIndex) < min) {
            this.defaultIndex -= 1;
          } else {
            moved /= 3;
            bufferSpeed = 20;
          }
        }
      }

      this.numericalConversion(this.defaultIndex);
      const nowDistance = moved + oldIndex * this.scaleSize;
      const targetDistance = this.defaultIndex * this.scaleSize;
      this.startMove(nowDistance, targetDistance, bufferSpeed).then(() => {
        if (loop) {
          if (this.defaultIndex <= -max) {
            //1，Solution in Cycle
            //2，Slide from the first to the first
            //3，The problem of momentary blankness caused by stopping manual sliding and triggering the timer
            this.defaultIndex = -1;
            this.slideMove(this.defaultIndex * this.scaleSize);
          }
          if (this.defaultIndex >= 0) {
            this.defaultIndex = -length;
            this.slideMove(this.defaultIndex * this.scaleSize);
          }
        }

        if (this.auto) {
          this.clear();
          this.timer = this.setInterval();
        }
      });
    } else {
      const bufferSpeed: number = speed / 5;
      if (!this.loop) {
        const distance = this.defaultIndex * this.scaleSize + moved;
        if (distance >= 0) {
          moved /= 3;
        } else {
          if (distance <= this.scaleSize * -min) {
            moved /= 3;
          }
        }
      }
      const nowDistance: number = this.defaultIndex * this.scaleSize + moved;
      const targetDistance: number = nowDistance - moved;
      this.startMove(nowDistance, targetDistance, bufferSpeed).then(() => {
        if (this.auto) {
          this.clear();
          this.timer = this.setInterval();
        }
      });
    }
  }
  private fadeProcess(moved: number, scale: number) {
    //Calculate the next subscript in the sliding process,
    //find a new coordinate,
    //and calculate the transparency of the current and transitional coordinates according to the sliding ratio.
    const min: number = this.length - 1;
    const oldIndex: number = this.index;
    let newIndex: number = this.index;
    if (moved < 0) {
      newIndex += 1;
      if (newIndex > min) {
        newIndex = 0;
      }
    } else {
      newIndex -= 1;
      if (newIndex < 0) {
        newIndex = min;
      }
    }
    this.fadeMove(oldIndex, scale, newIndex);
  }
  private slideProcess(distance: number, moved: number) {
    if (!this.loop) {
      if (distance >= 0) {
        distance /= 3;
        this.slideMove(distance);
      } else {
        const max: number = this.length - 1;
        if (distance <= this.scaleSize * -max) {
          moved /= 3;
          distance = this.scaleSize * -max + moved;
        }
        this.slideMove(distance);
      }
      return;
    }
    if (distance >= 0) {
      this.defaultIndex = -this.length;
      this.slideMove(this.defaultIndex * this.scaleSize);
    } else if (distance <= -((this.length + 1) * this.scaleSize)) {
      this.defaultIndex = -1;
      this.slideMove(this.defaultIndex * this.scaleSize);
    } else {
      this.slideMove(distance);
    }
  }
  private fadeSetIndex(moved: number): number {
    //This applies to non-added loops//fade status
    const loop: boolean = this.loop;
    const oldIndex: number = this.index;
    if (moved > 0) {
      this.index -= 1;
      if (this.index < 0) {
        if (loop) {
          this.index = this.length - 1;
        } else {
          this.index = 0;
        }
      }
    }
    if (moved < 0) {
      this.index += 1;
      if (this.index > this.length - 1) {
        if (loop) {
          this.index = 0;
        } else {
          this.index = this.length - 1;
        }
      }
    }
    if (oldIndex === this.index) {
      return this.index;
    }
    this.callBack(this.index);
    return this.index;
  }
  private numericalConversion(index: number): void {
    // defaultIndex Convert to index
    let num: number;
    if (this.loop) {
      switch (index) {
        case -1:
        case -(this.length + 1):
          num = 0;
          break;
        case 0:
          num = this.length - 1;
          break;
        default:
          num = Math.abs(index) - 1;
          break;
      }
      if (num !== this.index) {
        this.index = num;
      }

      this.callBack(this.index);
    } else {
      num = Math.abs(index);
      if (num !== this.index) {
        this.index = num;
        this.callBack(this.index);
      }
    }
  }
  moveTo(index: number): void {
    index = Math.abs(index);
    const max: number = this.length + 1;
    const min: number = this.length - 1;
    const speed: number = this.speed;
    if (index > min) {
      index = min;
    }
    const oldIndex: number = this.index;
    const newIndex: number = (this.index = index);
    const length: number = this.length;

    if (this.effect === 'fade') {
      if (newIndex === oldIndex) {
        this.startMove(0, 1, fadeFloat, newIndex);
      } else {
        this.callBack(newIndex);
        this.startMove(0, 1, fadeFloat, newIndex, oldIndex);
      }
      return;
    }

    if (oldIndex === newIndex) return;

    if (this.loop) {
      if (index === min) {
        index = -length;
        const nowDistance: number = this.defaultIndex * this.scaleSize;
        const targetDistance: number = index * this.scaleSize;
        this.defaultIndex = index;
        this.numericalConversion(this.defaultIndex);
        const s =
          Math.abs(oldIndex - Math.abs(this.defaultIndex)) * speed < 100
            ? 100
            : Math.abs(oldIndex - Math.abs(this.defaultIndex)) * speed;

        this.startMove(nowDistance, targetDistance, s).then(() => {});
        return;
      }
      if (index === 0) {
        if (this.defaultIndex === -max) {
          this.defaultIndex = -1;
          this.slideMove(this.defaultIndex * this.scaleSize);
          return;
        }
      }
      index = -index - 1;

      const nowDistance = this.defaultIndex * this.scaleSize;
      const targetDistance = index * this.scaleSize;
      this.defaultIndex = index;
      const disparity: number = Math.max(
        Math.abs(oldIndex - Math.abs(this.defaultIndex)),
        3
      );
      const s: number = disparity * speed;
      this.numericalConversion(this.defaultIndex);
      this.startMove(nowDistance, targetDistance, s).then(() => {});
    } else {
      index = -index;
      const disparity: number = Math.max(
        Math.abs(oldIndex - Math.abs(index)),
        3
      );
      const s: number = disparity * speed;
      const nowDistance: number = this.defaultIndex * this.scaleSize;
      const targetDistance: number = index * this.scaleSize;
      this.defaultIndex = index;
      this.callBack(Math.abs(index));
      this.startMove(nowDistance, targetDistance, s).then(() => {});
    }
  }
  private aotoplay() {
    const speed: number = this.speed;
    const startplay = (): void => {
      const oldIndex: number = this.defaultIndex;
      const max: number = this.length + 1;
      if (this.loop) {
        this.defaultIndex -= 1;
        if (this.defaultIndex <= -max) {
          this.defaultIndex = -max;
        }
      } else {
        this.defaultIndex -= 1;
        if (this.defaultIndex <= -this.length) {
          this.defaultIndex = 0;
        }
      }
      this.numericalConversion(this.defaultIndex);
      let newSpeed: number =
        (speed * Math.abs(Math.abs(oldIndex) - Math.abs(this.defaultIndex))) /
        2;
      const nowDistance: number = oldIndex * this.scaleSize;
      const targetDistance: number = this.defaultIndex * this.scaleSize;
      this.startMove(nowDistance, targetDistance, newSpeed).then(() => {
        if (this.loop) {
          if (this.defaultIndex <= -max) {
            this.defaultIndex = -1;
            this.slideMove(this.defaultIndex * this.scaleSize);
          }
        }
      });
    };
    const fade_startplay = (): void => {
      const oldIndex = this.index;
      this.index += 1;
      if (this.index > this.length - 1) {
        this.index = 0;
      }
      const newIndex: number = this.index;
      this.callBack(newIndex);
      this.startMove(0, 1, fadeFloat, newIndex, oldIndex).then((res) => {
        //console.log(this.index)
      });
    };
    switch (this.effect) {
      case 'slide':
        return startplay();
      case 'fade':
        return fade_startplay();
      default:
        break;
    }
  }
  private slideMove(distance: number): void {
    const direction: string = this.direction;
    const slider = this.slider;
    if (direction === 'horizontal') {
      slider['style']['transform'] = 'translate3d(' + distance + 'px,0,0)';
    }
    if (direction === 'vertical') {
      slider['style']['transform'] = 'translate3d(0,' + distance + 'px,0)';
    }
    slider['style'].transition = null;
  }
  private fadeMove(index: number, scale: number = 1, oldIndex?: number) {
    let length = this.length;
    let list = this.children;
    for (let i = 0; i < length; i++) {
      list[i]['style'].opacity = 0;
      list[i]['style']['z-index'] = 0;
    }
    list[index]['style']['opacity'] = scale;
    list[index]['style']['z-index'] = 1;
    if (typeof oldIndex === 'number') {
      list[oldIndex]['style'].opacity = 1 - scale;
    }
  }
  private startMove(
    nowDistance: number,
    targetDistance: number,
    speed: number | any = 30,
    index?: number,
    oldIndex?: number
  ) {
    let n: number = nowDistance;
    const t: number = targetDistance;
    let signal: Function;
    const pro = new Promise((res) => (signal = res));
    const step = () => {
      if (n < t) {
        n += speed;
        if (n >= t) {
          n = t;
        }
      } else if (n > t) {
        n -= speed;
        if (n <= t) {
          n = t;
        }
      }
      if (this.effect === 'slide') {
        this.slideMove(n);
      } else {
        this.fadeMove(index, n, oldIndex);
      }
      if (nowDistance > targetDistance) {
        if (n > t) {
          window.requestAnimationFrame(step);
        } else {
          signal();
        }
      }
      if (nowDistance < targetDistance) {
        if (n < t) {
          window.requestAnimationFrame(step);
        } else {
          signal();
        }
      }
    };
    window.requestAnimationFrame(step);
    return pro;
  }
  destroy() {
    this.clear();
    this.slider.removeEventListener('touchstart', this._start, this.will);
    this.slider.removeEventListener('touchmove', this._move, this.will);
    this.slider.removeEventListener('touchend', this._end, this.will);
    this.slider.removeEventListener('mousedown', this._start, this.will);
    this.slider.removeEventListener('mousemove', this._move, this.will);
    this.slider.removeEventListener('mouseup', this._end, this.will);
    this.slider.removeEventListener('click', this._closeDefault, true);
  }
}

export default FineSwiper;
