import { direction, Options, Root } from './type';

import createTouch, {
  MoveCallbackArguments,
  EndCallbackArguments,
  FineTouch,
} from './createTouch';

const referenceSizeValue = 800;
const referenceSpeed = 30;

class Slide {
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
  constructor(options: Options) {
    this.options = options;
    this.root = options.root;
    this.direction = options.direction || 'horizontal';

    this.slideChange = options.slideChange || ((index) => {});
    this.disabledHandSlideing = !!options.disabledHand;
    this.loop = options.scaleValue
      ? false
      : options.loop
      ? options.loop
      : false;
    this.scaleValue = options.scaleValue || this.getSize();
    this.slideContainer = this.root.children[0] as HTMLElement;
    if (!this.slideContainer) {
      throw new Error('Rolling containers are indispensable');
    }
    if (this.slideContainer.nodeType !== 1) {
      throw new Error('The scroll container must be an element');
    }
    /*
        Scale that should slide at one time
    */
    this.slideList = this.slideContainer.children;
    this.length = this.slideList.length;
    if (this.length < 2) {
      console.warn('The scroll container must have at least one child element');
      return;
    }
    this.index = options.index || 0;

    this.init();
    this.touchInstance = createTouch({
      root: this.root,
      startCallback(arg) {},
      moveCallback: (arg) => {
        this.setSlideDistanceByStep(arg);
        this.setTranslate();
      },
      endCallback: (arg) => {
        //this.toNextCycle(arg);
        this.__toNextCycle(arg);
      },
    });
  }
  init() {
    this.rePlanningElements();
    this.setSlideDistanceByIndex();
    this.setTranslate();
    this.maxSlideDistance = this.getMaxSlideDistance();
    this.setAnimateSped();
  }
  resize() {
    this.scaleValue = this.options.scaleValue || this.getSize();
    this.setSlideDistanceByIndex();
    this.setTranslate();
    this.maxSlideDistance = this.getMaxSlideDistance();
    this.setAnimateSped();
  }
  reinitialize() {
    const { loop } = this;

    if (loop) {
      const newSlideList = this.slideContainer.children;
      const length = newSlideList.length;
      if (length < 4) {
      } else {
        const oldFirstChild = newSlideList[0];
        const oldLastChild = newSlideList[length - 1];
        // const newFirstChild = newSlideList[1].cloneNode(true);
        // const newLastChild = newSlideList[length - 1].cloneNode(true);
        // this.slideContainer.replaceChild(newFirstChild, oldFirstChild);
        // this.slideContainer.replaceChild(newLastChild, oldLastChild);
        this.slideContainer.removeChild(oldFirstChild);
        this.slideContainer.removeChild(oldLastChild);
        this.slideList = this.slideContainer.children;
        this.length = this.slideList.length;
        this.rePlanningElements();
        this.setSlideDistanceByIndex();
        this.setTranslate();
        this.maxSlideDistance = this.getMaxSlideDistance();
      }
    } else {
      this.slideList = this.slideContainer.children;
      this.length = this.slideList.length;
      this.maxSlideDistance = this.getMaxSlideDistance();
    }
  }
  destroy() {
    this.touchInstance.destroy();
  }
  setAnimateSped() {
    const size = this.scaleValue;
    this.animateSped = Math.ceil((size / referenceSizeValue) * referenceSpeed);
  }
  rePlanningElements() {
    const { loop, slideContainer, slideList, length } = this;
    if (loop) {
      const currentFirst = slideList[0];
      const first = currentFirst.cloneNode(true);
      const last = slideList[length - 1].cloneNode(true);
      slideContainer.appendChild(first);
      slideContainer.insertBefore(last, currentFirst);
    }
  }
  setSlideDistanceByStep(arg: MoveCallbackArguments) {
    const { stepX, stepY } = arg;
    if (this.direction === 'vertical') {
      this.slideDistance += stepY;
    } else {
      this.slideDistance += stepX;
    }
  }
  setSlideDistanceByIndex() {
    let { index, loop, scaleValue } = this;
    if (loop) {
      index += 1;
    }
    this.slideDistance = -scaleValue * index;
  }
  setTranslate() {
    const { direction, slideContainer, slideDistance } = this;
    if (direction === 'horizontal') {
      slideContainer['style']['transform'] =
        'translate3d(' + slideDistance + 'px,0,0)';
    }
    if (direction === 'vertical') {
      slideContainer['style']['transform'] =
        'translate3d(0,' + slideDistance + 'px,0)';
    }
  }

  __toNextCycle(arg: EndCallbackArguments) {
    const { direction, animateSped } = this;
    const { movedX, movedY, speedX, speedY } = arg;
    const sped = direction === 'vertical' ? speedY : speedX;
    const movedDistance = direction === 'vertical' ? movedY : movedX;

    this.cancelAnimation();
    if (Math.abs(sped) > 10) {
      const targetDistance = this.__getNextCriticalValue(movedDistance);
      this.startAnimation(
        this.slideDistance,
        targetDistance,
        animateSped,
        (distance: number) => {
          this.slideDistance = distance;
          this.setTranslate();
        }
      ).then(() => {
        this.setIndexBySlideDistance();
        this.rescheduleSlidingDistance();
      });
    } else {
      const targetDistance = this.__getPrevCriticalValue(movedDistance);

      this.startAnimation(
        this.slideDistance,
        targetDistance,
        animateSped,
        (distance: number) => {
          this.slideDistance = distance;
          this.setTranslate();
        }
      ).then(() => {
        this.setIndexBySlideDistance();
        this.rescheduleSlidingDistance();
      });
    }
  }
  __getNextCriticalValue(movedDistance: number): number {
    const { scaleValue, slideDistance, maxSlideDistance } = this;
    if (slideDistance > 0) {
      return 0;
    }
    let quantity = Math.abs(slideDistance / scaleValue);
    if (movedDistance < 0) {
      quantity = Math.ceil(quantity);
    } else if (movedDistance > 0) {
      quantity = Math.floor(quantity);
    }
    return -Math.min(quantity * scaleValue, maxSlideDistance);
  }
  __getPrevCriticalValue(movedDistance: number): number {
    const { scaleValue, slideDistance, maxSlideDistance } = this;
    if (slideDistance > 0) {
      return 0;
    }
    const quantity = Math.round(Math.abs(slideDistance / scaleValue));

    return -Math.min(quantity * scaleValue, maxSlideDistance);
  }
  //   toNextCycle(arg: EndCallbackArguments) {
  //     const { direction, animateSped } = this;
  //     const { movedX, movedY, speedX, speedY } = arg;
  //     const sped = direction === 'vertical' ? speedY : speedX;
  //     const movedDistance = direction === 'vertical' ? movedY : movedX;

  //     this.cancelAnimation();
  //     if (Math.abs(sped) > 10) {
  //       const value = this.getNextCriticalValue(sped);
  //       this.startAnimation(
  //         this.slideDistance,
  //         this.slideDistance + value,
  //         animateSped,
  //         (distance: number) => {
  //           this.slideDistance = distance;
  //           this.setTranslate();
  //         }
  //       ).then(() => {
  //         this.setIndexBySlideDistance();
  //         this.rescheduleSlidingDistance();
  //       });
  //     } else {
  //       const value = this.getPrevCriticalValue(movedDistance);
  //       const targetValue = this.slideDistance + value;

  //       this.startAnimation(
  //         this.slideDistance,
  //         targetValue,
  //         animateSped,
  //         (distance: number) => {
  //           this.slideDistance = distance;
  //           this.setTranslate();
  //         }
  //       ).then(() => {
  //         this.setIndexBySlideDistance();
  //       });
  //     }
  //   }
  //   getPrevCriticalValue(movedDistance: number): number {
  //     if (movedDistance < 0) {
  //       if (!this.loop) {
  //         if (Math.abs(this.slideDistance) > this.maxSlideDistance) {
  //           return Math.abs(this.slideDistance) - this.maxSlideDistance;
  //         }
  //       }
  //       return -this.slideDistance % this.scaleValue;
  //     } else {
  //       if (!this.loop) {
  //         //This judgment condition is to ensure the consistency of judgment code
  //         //Because in the cycle mode, the sliding distance can never be greater than 0
  //         if (this.slideDistance > 0) {
  //           //In acyclic mode, it is triggered when it still slides to the previous position at the initial position
  //           //This condition can never be triggered in cyclic mode
  //           return -this.slideDistance;
  //         }
  //       }

  //       return -(
  //         this.scaleValue - Math.abs(this.slideDistance % this.scaleValue)
  //       );
  //     }
  //   }
  //   getNextCriticalValue(sped: number): number {
  //     if (sped < 0) {
  //       if (!this.loop) {
  //         //const maxPositionIndex = this.length - 1;
  //         if (
  //           Math.abs(this.slideDistance) >
  //           this.maxSlideDistance /*this.scaleValue * maxPositionIndex*/
  //         ) {
  //           return (
  //             Math.abs(this.slideDistance) - this.maxSlideDistance //this.scaleValue * maxPositionIndex
  //           );
  //         }
  //       }

  //       return -(
  //         this.scaleValue - Math.abs(this.slideDistance % this.scaleValue)
  //       );
  //     } else {
  //       if (!this.loop) {
  //         //When user defined scaleValue
  //         if (this.slideDistance > 0) {
  //           return -this.slideDistance;
  //         }
  //       }
  //       return -this.slideDistance % this.scaleValue;
  //     }
  //   }
  toPrevPage() {
    const arg = {
      movedX: 20,
      movedY: 20,
      speedX: 20,
      speedY: 20,
    };
    this.slideDistance += 20;
    this.__toNextCycle(arg);
  }
  toNextPage() {
    const arg = {
      movedX: -20,
      movedY: -20,
      speedX: -20,
      speedY: -20,
    };
    this.slideDistance -= 20;
    this.__toNextCycle(arg);
  }
  toPage(page: number) {
    const { length, scaleValue, index } = this;
    page = Math.min(page, length - 1);
    page = Math.max(0, page);
    if (page === index) return;
    const positiveAndNegative = page > index ? -1 : 1;
    const arg = {
      movedX: 20 * positiveAndNegative,
      movedY: 20 * positiveAndNegative,
      speedX: 20 * positiveAndNegative,
      speedY: 20 * positiveAndNegative,
    };
    const differencePage = index - page;
    this.slideDistance += (differencePage - positiveAndNegative) * scaleValue;
    this.slideDistance += 20 * positiveAndNegative;
    this.__toNextCycle(arg);
  }
  setIndexBySlideDistance() {
    const { loop, slideDistance, scaleValue, length } = this;
    let index = Math.ceil(Math.abs(slideDistance / scaleValue));
    if (loop) {
      index -= 1;
      if (index >= length) {
        index = 0;
      } else if (index < 0) {
        index = length - 1;
      }
    }
    const isChange = this.index !== index;
    if (isChange) {
      this.index = index;
      this.slideChange(index);
    }
  }
  rescheduleSlidingDistance() {
    const { loop, slideDistance, scaleValue, length } = this;
    let quantity = Math.ceil(Math.abs(slideDistance / scaleValue));
    if (loop) {
      quantity -= 1;
      if (quantity >= length) {
        this.slideDistance = -this.scaleValue;
      } else if (quantity < 0) {
        this.slideDistance = -length * this.scaleValue;
      }
      this.setTranslate();
    }
  }
  getSize() {
    const { direction, root } = this;
    const { width = 0, height = 0 } = root.getBoundingClientRect();
    if (direction === 'vertical') {
      return height;
    } else {
      return width;
    }
  }
  getMaxSlideDistance() {
    const size = this.getSize();
    const slideContentSize = this.getSlideContentSize();
    return slideContentSize - size;
  }
  getSlideContentSize() {
    const { slideList, direction } = this;
    let size = 0;
    for (let i = 0; i < slideList.length; i++) {
      const el = slideList[i];
      const { width, height } = el.getBoundingClientRect();
      if (direction === 'vertical') {
        size += height;
      } else {
        size += width;
      }
    }
    return size;
  }
  startAnimation(
    nowDistance: number,
    targetDistance: number,
    speed: number | any = 30,
    cb: Function
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
      cb(n);
      if (nowDistance > targetDistance) {
        if (n > t) {
          this.animateId = window.requestAnimationFrame(step);
        } else {
          signal();
        }
      }
      if (nowDistance < targetDistance) {
        if (n < t) {
          this.animateId = window.requestAnimationFrame(step);
        } else {
          signal();
        }
      }
    };
    this.animateId = window.requestAnimationFrame(step);
    return pro;
  }
  cancelAnimation() {
    window.cancelAnimationFrame(this.animateId);
  }
}

const createSlide = (options: Options): Slide => {
  return new Slide(options);
};

export default createSlide;
