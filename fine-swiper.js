const isTouchEvent = (e) => e instanceof TouchEvent;
function registerStart(root, callback) {
    root.addEventListener('touchstart', callback);
    root.addEventListener('mousedown', callback);
}
function registerMove(root, callback) {
    document.addEventListener('touchmove', callback);
    document.addEventListener('mousemove', callback);
}
function registerEnd(root, callback) {
    document.addEventListener('touchend', callback);
    document.addEventListener('touchcancel', callback);
    document.addEventListener('mouseup', callback);
}
function destroyStart(root, callback) {
    root.removeEventListener('touchstart', callback);
    root.removeEventListener('mousedown', callback);
}
function destroyMove(root, callback) {
    document.removeEventListener('touchmove', callback);
    document.removeEventListener('mousemove', callback);
}
function destroyEnd(root, callback) {
    document.removeEventListener('touchend', callback);
    document.removeEventListener('touchcancel', callback);
    document.removeEventListener('mouseup', callback);
}
class FineTouch {
    constructor(option) {
        const { root, moveCallback = () => { }, startCallback = () => { }, endCallback = () => { }, } = option;
        this.hasMove = true;
        this.isStart = false;
        this.root = root;
        const positions = [];
        let lastTimeStamp = 0;
        let stepX = 0;
        let stepY = 0;
        let startX = 0;
        let startY = 0;
        this.startMethod = (e) => {
            this.hasMove = false;
            this.isStart = true;
            if (e.type === 'mousedown') {
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
            if (!this.isStart)
                return;
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
            if (!this.isStart)
                return;
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
                    const timeOffset = positions[endPos].timeStamp - positions[startPos].timeStamp;
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
const createTouch = (option) => {
    return new FineTouch(option);
};

const referenceSizeValue = 800;
const referenceSpeed = 30;
class Slide {
    constructor(options) {
        this.options = options;
        this.root = options.root;
        this.direction = options.direction || 'horizontal';
        this.slideChange = options.slideChange || ((index) => { });
        this.disabledHandSlideing = !!options.disabledHand;
        this.loop = options.scaleValue
            ? false
            : options.loop
                ? options.loop
                : false;
        this.scaleValue = options.scaleValue || this.getSize();
        this.slideContainer = this.root.children[0];
        if (!this.slideContainer) {
            throw new Error('Rolling containers are indispensable');
        }
        if (this.slideContainer.nodeType !== 1) {
            throw new Error('The scroll container must be an element');
        }
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
            startCallback(arg) { },
            moveCallback: (arg) => {
                this.setSlideDistanceByStep(arg);
                this.setTranslate();
            },
            endCallback: (arg) => {
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
            if (length < 4) ;
            else {
                const oldFirstChild = newSlideList[0];
                const oldLastChild = newSlideList[length - 1];
                this.slideContainer.removeChild(oldFirstChild);
                this.slideContainer.removeChild(oldLastChild);
                this.slideList = this.slideContainer.children;
                this.length = this.slideList.length;
                this.rePlanningElements();
                this.setSlideDistanceByIndex();
                this.setTranslate();
                this.maxSlideDistance = this.getMaxSlideDistance();
            }
        }
        else {
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
    setSlideDistanceByStep(arg) {
        const { stepX, stepY } = arg;
        if (this.direction === 'vertical') {
            this.slideDistance += stepY;
        }
        else {
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
    __toNextCycle(arg) {
        const { direction, animateSped } = this;
        const { movedX, movedY, speedX, speedY } = arg;
        const sped = direction === 'vertical' ? speedY : speedX;
        const movedDistance = direction === 'vertical' ? movedY : movedX;
        this.cancelAnimation();
        if (Math.abs(sped) > 10) {
            const targetDistance = this.__getNextCriticalValue(movedDistance);
            this.startAnimation(this.slideDistance, targetDistance, animateSped, (distance) => {
                this.slideDistance = distance;
                this.setTranslate();
            }).then(() => {
                this.setIndexBySlideDistance();
                this.rescheduleSlidingDistance();
            });
        }
        else {
            const targetDistance = this.__getPrevCriticalValue(movedDistance);
            this.startAnimation(this.slideDistance, targetDistance, animateSped, (distance) => {
                this.slideDistance = distance;
                this.setTranslate();
            }).then(() => {
                this.setIndexBySlideDistance();
                this.rescheduleSlidingDistance();
            });
        }
    }
    __getNextCriticalValue(movedDistance) {
        const { scaleValue, slideDistance, maxSlideDistance } = this;
        if (slideDistance > 0) {
            return 0;
        }
        let quantity = Math.abs(slideDistance / scaleValue);
        if (movedDistance < 0) {
            quantity = Math.ceil(quantity);
        }
        else if (movedDistance > 0) {
            quantity = Math.floor(quantity);
        }
        return -Math.min(quantity * scaleValue, maxSlideDistance);
    }
    __getPrevCriticalValue(movedDistance) {
        const { scaleValue, slideDistance, maxSlideDistance } = this;
        if (slideDistance > 0) {
            return 0;
        }
        const quantity = Math.round(Math.abs(slideDistance / scaleValue));
        return -Math.min(quantity * scaleValue, maxSlideDistance);
    }
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
    toPage(page) {
        const { length, scaleValue, index } = this;
        page = Math.min(page, length - 1);
        page = Math.max(0, page);
        if (page === index)
            return;
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
            }
            else if (index < 0) {
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
            }
            else if (quantity < 0) {
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
        }
        else {
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
            }
            else {
                size += width;
            }
        }
        return size;
    }
    startAnimation(nowDistance, targetDistance, speed = 30, cb) {
        let n = nowDistance;
        const t = targetDistance;
        let signal;
        const pro = new Promise((res) => (signal = res));
        const step = () => {
            if (n < t) {
                n += speed;
                if (n >= t) {
                    n = t;
                }
            }
            else if (n > t) {
                n -= speed;
                if (n <= t) {
                    n = t;
                }
            }
            cb(n);
            if (nowDistance > targetDistance) {
                if (n > t) {
                    this.animateId = window.requestAnimationFrame(step);
                }
                else {
                    signal();
                }
            }
            if (nowDistance < targetDistance) {
                if (n < t) {
                    this.animateId = window.requestAnimationFrame(step);
                }
                else {
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
const createSlide = (options) => {
    return new Slide(options);
};

export { createSlide, createTouch };
