const time = Date.now ||
    function () {
        return +new Date();
    };
const noop = function () { };

class FineSwiper$1 {
    constructor(options) {
        this.root = options.root;
        this.direction = options.direction;
        this.loop = options.loop;
        this.auto = options.auto;
        this.delayed = options.delayed;
        this.startTime = 0;
        this.callback = options.callback || noop;
        this.enter = options.enter || noop;
        this.startingPoint = 0;
        this.isTracking = false;
        this.captureClick = false;
        this.disabledHandSlideing = !!options.disabledHand;
        this.timer = null;
        this.defaultIndex = this.loop ? -1 : 0;
        this.slider = this.root.children[0];
        this.children = this.slider.children;
        const children = this.children;
        this.length = children.length;
        const firstElement = children[0];
        const { width, height } = firstElement.getBoundingClientRect();
        this.scaleWidth = width;
        this.scaleHeight = height;
        this.scaleSize = this.direction === 'horizontal' ? width : height;
        this._closeDefault = ev => {
            this.closeDefault(ev);
        };
        this.slider.addEventListener('click', this._closeDefault, true);
        document.addEventListener('visibilitychange', this._visibilitychange.bind(this));
    }
    closeDefault(ev) {
        const e = ev || event;
        if (this.captureClick) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    _visibilitychange() { }
    clear() {
        window.clearInterval(this.timer);
    }
    startMove(nowDistance, targetDistance, speed = 30, cb) {
        let n = nowDistance;
        const t = targetDistance;
        let signal;
        const pro = new Promise(res => (signal = res));
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
                    window.requestAnimationFrame(step);
                }
                else {
                    signal();
                }
            }
            if (nowDistance < targetDistance) {
                if (n < t) {
                    window.requestAnimationFrame(step);
                }
                else {
                    signal();
                }
            }
        };
        window.requestAnimationFrame(step);
        return pro;
    }
}

const scale = 30 / 375;
class FineSlideSwiper extends FineSwiper$1 {
    constructor(props) {
        super(props);
        const scaleSize = this.scaleSize;
        this.speed = Math.ceil(scale * scaleSize);
        this.initSetIndex(props.index);
        this.isLoop();
        if (this.auto) {
            this.timer = this.setInterval();
        }
        this._start = ev => {
            this.start(ev);
        };
        this._move = ev => {
            this.move(ev);
        };
        this._end = ev => {
            this.end(ev);
        };
        this.slider.addEventListener('touchstart', this._start, this.will);
        this.slider.addEventListener('touchmove', this._move, this.will);
        this.slider.addEventListener('touchend', this._end, this.will);
        this.slider.addEventListener('touchcancel', this._end, this.will);
        this.slider.addEventListener('mousedown', this._start, this.will);
        this.slider.addEventListener('mousemove', this._move, this.will);
        this.slider.addEventListener('mouseup', this._end, this.will);
    }
    _visibilitychange() {
        if (document.hidden) {
            this.clear();
        }
        else {
            if (this.auto) {
                this.timer = this.setInterval();
            }
        }
    }
    isLoop() {
        const children = this.children;
        const length = this.length;
        if (this.loop) {
            const first = children[0].cloneNode(true);
            const last = children[length - 1].cloneNode(true);
            this.slider.appendChild(first);
            this.slider.insertBefore(last, children[0]);
        }
    }
    initSetIndex(index) {
        index = Math.min(Math.abs(index), this.length - 1);
        if (this.loop) {
            this.defaultIndex = -(index + 1);
        }
        else {
            this.defaultIndex = -index;
        }
        this.slideMove(this.defaultIndex * this.scaleSize);
        this.index = index;
    }
    setInterval() {
        return window.setInterval(this.aotoplay.bind(this), this.delayed);
    }
    start(ev) {
        const e = ev || event;
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        const touches = e.touches;
        const target = touches ? touches[0] : e;
        const { direction, disabledHandSlideing } = this;
        this.startingPoint =
            direction === 'horizontal' ? target.clientX : target.clientY;
        this.startTime = time();
        this.isTracking = true;
        this.captureClick = false;
        if (disabledHandSlideing)
            return;
    }
    move(ev) {
        if (!this.isTracking) {
            return;
        }
        const e = ev || event;
        if (e.type === 'mousemove') {
            this.captureClick = true;
        }
        e.preventDefault();
        const { disabledHandSlideing, direction } = this;
        if (disabledHandSlideing)
            return;
        const touches = e.changedTouches;
        const target = touches ? touches[0] : e;
        const moved = direction === 'horizontal'
            ? target.clientX - this.startingPoint
            : target.clientY - this.startingPoint;
        this.clear();
        this.slideProcess(moved + this.defaultIndex * this.scaleSize, moved);
    }
    end(ev) {
        if (!this.isTracking) {
            return;
        }
        this.isTracking = false;
        if (this.disabledHandSlideing)
            return;
        const e = ev || event;
        const touches = e.changedTouches;
        const target = touches ? touches[0] : e;
        let moved = this.direction === 'horizontal'
            ? target.clientX - this.startingPoint
            : target.clientY - this.startingPoint;
        if (Math.abs(moved) === 0) {
            return;
        }
        const duration = time() - this.startTime;
        const toNext = Math.abs(moved) > this.scaleSize / 2 || duration < 300;
        const loop = this.loop;
        const length = this.length;
        const noLoopMinDefaultIndex = -(this.length - 1);
        const loopMinDefaultIndex = -(this.length + 1);
        const speed = this.speed;
        const oldIndex = this.defaultIndex;
        let bufferSpeed = speed;
        const scaleIndex = moved > 0 ? 1 : -1;
        if (loop) {
            let nowDistance = oldIndex * this.scaleSize + moved;
            if (toNext) {
                this.defaultIndex += scaleIndex;
                if (moved > 0) {
                    if (this.defaultIndex > 0) {
                        this.defaultIndex = 0;
                    }
                }
                else {
                    if (Math.abs(this.defaultIndex) > Math.abs(loopMinDefaultIndex)) {
                        this.defaultIndex = loopMinDefaultIndex;
                    }
                }
            }
            this.numericalConversion(this.defaultIndex);
            const targetDistance = this.defaultIndex * this.scaleSize;
            this.startMove(nowDistance, targetDistance, bufferSpeed, (n) => {
                this.slideMove(n);
            }).then(() => {
                if (this.defaultIndex <= loopMinDefaultIndex) {
                    this.defaultIndex = -1;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                }
                if (this.defaultIndex >= 0) {
                    this.defaultIndex = -length;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                }
                this.enter(this.index);
                if (this.auto) {
                    this.clear();
                    this.timer = this.setInterval();
                }
            });
        }
        else {
            if (toNext) {
                if (moved > 0) {
                    if (this.defaultIndex < 0) {
                        this.defaultIndex += scaleIndex;
                    }
                    else {
                        moved /= 3;
                    }
                }
                else {
                    if (Math.abs(this.defaultIndex) < Math.abs(noLoopMinDefaultIndex)) {
                        this.defaultIndex += scaleIndex;
                    }
                    else {
                        moved /= 3;
                    }
                }
            }
            else {
                const distance = this.defaultIndex * this.scaleSize + moved;
                const max = this.scaleSize * noLoopMinDefaultIndex;
                if (distance > 0) {
                    moved /= 3;
                }
                else {
                    if (distance < max) {
                        moved /= 3;
                    }
                }
            }
            this.numericalConversion(this.defaultIndex);
            let nowDistance = oldIndex * this.scaleSize + moved;
            const targetDistance = this.defaultIndex * this.scaleSize;
            this.startMove(nowDistance, targetDistance, bufferSpeed, (n) => {
                this.slideMove(n);
            }).then(() => {
                this.enter(this.index);
                if (this.auto) {
                    this.clear();
                    this.timer = this.setInterval();
                }
            });
        }
    }
    slideProcess(distance, moved) {
        if (!this.loop) {
            if (distance >= 0) {
                distance /= 3;
                this.slideMove(distance);
            }
            else {
                const max = this.length - 1;
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
        }
        else if (distance <= -((this.length + 1) * this.scaleSize)) {
            this.defaultIndex = -1;
            this.slideMove(this.defaultIndex * this.scaleSize);
        }
        else {
            this.slideMove(distance);
        }
    }
    numericalConversion(index) {
        let num;
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
            this.callback(this.index);
        }
        else {
            num = Math.abs(index);
            if (num !== this.index) {
                this.index = num;
                this.callback(this.index);
            }
        }
    }
    moveTo(index) {
        this.clear();
        index = Math.abs(index);
        const loopMinDefaultIndex = -(this.length + 1);
        const min = this.length - 1;
        const speed = this.speed;
        if (index > min) {
            index = min;
        }
        const oldIndex = this.index;
        const newIndex = (this.index = index);
        const length = this.length;
        this.defaultIndex;
        if (oldIndex === newIndex)
            return;
        if (this.loop) {
            if (index === min) {
                index = -length;
                const nowDistance = this.defaultIndex * this.scaleSize;
                const targetDistance = index * this.scaleSize;
                this.defaultIndex = index;
                this.numericalConversion(this.defaultIndex);
                const s = Math.abs(oldIndex - Math.abs(this.defaultIndex)) * speed < 100
                    ? 100
                    : Math.abs(oldIndex - Math.abs(this.defaultIndex)) * speed;
                this.startMove(nowDistance, targetDistance, s, (n) => {
                    this.slideMove(n);
                }).then(() => {
                    if (this.defaultIndex <= loopMinDefaultIndex) {
                        this.defaultIndex = -1;
                        this.slideMove(this.defaultIndex * this.scaleSize);
                    }
                    if (this.defaultIndex >= 0) {
                        this.defaultIndex = -length;
                        this.slideMove(this.defaultIndex * this.scaleSize);
                    }
                    this.enter(this.index);
                    if (this.auto) {
                        this.clear();
                        this.timer = this.setInterval();
                    }
                });
                return;
            }
            if (index === 0) {
                if (this.defaultIndex === loopMinDefaultIndex) {
                    this.defaultIndex = -1;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                    return;
                }
            }
            index = -index - 1;
            const nowDistance = this.defaultIndex * this.scaleSize;
            const targetDistance = index * this.scaleSize;
            this.defaultIndex = index;
            const disparity = Math.max(Math.abs(oldIndex - Math.abs(this.defaultIndex)), 3);
            const s = disparity * speed;
            this.numericalConversion(this.defaultIndex);
            this.startMove(nowDistance, targetDistance, s, (n) => {
                this.slideMove(n);
            }).then(() => {
                if (this.defaultIndex <= loopMinDefaultIndex) {
                    this.defaultIndex = -1;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                }
                if (this.defaultIndex >= 0) {
                    this.defaultIndex = -length;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                }
                this.enter(this.index);
                if (this.auto) {
                    this.clear();
                    this.timer = this.setInterval();
                }
            });
        }
        else {
            index = -index;
            const disparity = Math.max(Math.abs(oldIndex - Math.abs(index)), 3);
            const s = disparity * speed;
            const nowDistance = this.defaultIndex * this.scaleSize;
            const targetDistance = index * this.scaleSize;
            this.defaultIndex = index;
            this.callback(Math.abs(index));
            this.startMove(nowDistance, targetDistance, s, (n) => {
                this.slideMove(n);
            }).then(() => {
                if (this.defaultIndex <= loopMinDefaultIndex) {
                    this.defaultIndex = -1;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                }
                if (this.defaultIndex >= 0) {
                    this.defaultIndex = -length;
                    this.slideMove(this.defaultIndex * this.scaleSize);
                }
                this.enter(this.index);
                if (this.auto) {
                    this.clear();
                    this.timer = this.setInterval();
                }
            });
        }
    }
    aotoplay() {
        const speed = this.speed;
        const startplay = () => {
            const oldIndex = this.defaultIndex;
            const loopMinDefaultIndex = -(this.length + 1);
            this.defaultIndex += -1;
            if (this.loop) {
                if (this.defaultIndex <= loopMinDefaultIndex) {
                    this.defaultIndex = loopMinDefaultIndex;
                }
            }
            else {
                if (this.defaultIndex <= -this.length) {
                    this.defaultIndex = 0;
                }
            }
            this.numericalConversion(this.defaultIndex);
            let newSpeed = (speed * Math.abs(Math.abs(oldIndex) - Math.abs(this.defaultIndex))) / 2;
            const nowDistance = oldIndex * this.scaleSize;
            const targetDistance = this.defaultIndex * this.scaleSize;
            this.startMove(nowDistance, targetDistance, newSpeed, (n) => {
                this.slideMove(n);
            }).then(() => {
                this.enter(this.index);
                if (this.loop) {
                    if (this.defaultIndex <= loopMinDefaultIndex) {
                        this.defaultIndex = -1;
                        this.slideMove(this.defaultIndex * this.scaleSize);
                    }
                }
            });
        };
        return startplay();
    }
    slideMove(distance) {
        const direction = this.direction;
        const slider = this.slider;
        if (direction === 'horizontal') {
            slider['style']['transform'] = 'translate3d(' + distance + 'px,0,0)';
        }
        if (direction === 'vertical') {
            slider['style']['transform'] = 'translate3d(0,' + distance + 'px,0)';
        }
        slider['style'].transition = null;
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
        document.addEventListener('visibilitychange', this._visibilitychange);
    }
}

const fadeFloat = 0.05;
class FineFideSwiper extends FineSwiper$1 {
    constructor(props) {
        super(props);
        this.initSetIndex(props.index);
        this.ifEffectFade();
        if (this.auto) {
            this.timer = this.setInterval();
        }
        this._start = ev => {
            this.start(ev);
        };
        this._move = ev => {
            this.move(ev);
        };
        this._end = ev => {
            this.end(ev);
        };
        this.slider.addEventListener('touchstart', this._start, this.will);
        this.slider.addEventListener('touchmove', this._move, this.will);
        this.slider.addEventListener('touchend', this._end, this.will);
        this.slider.addEventListener('touchcancel', this._end, this.will);
        this.slider.addEventListener('mousedown', this._start, this.will);
        this.slider.addEventListener('mousemove', this._move, this.will);
        this.slider.addEventListener('mouseup', this._end, this.will);
    }
    _visibilitychange() {
        if (document.hidden) {
            this.clear();
        }
        else {
            if (this.auto) {
                this.timer = this.setInterval();
            }
        }
    }
    setInterval() {
        return window.setInterval(this.aotoplay.bind(this), this.delayed);
    }
    initSetIndex(index) {
        index = Math.min(Math.abs(index), this.length - 1);
        this.index = index;
    }
    ifEffectFade() {
        const children = this.children;
        const scaleHeight = this.scaleHeight;
        const length = this.length;
        for (let i = 0; i < length; i++) {
            children[i]['style'].transform =
                'translate3d(0,' + -i * scaleHeight + 'px,0)';
        }
        this.fadeMove(1, this.index);
    }
    start(ev) {
        const e = ev || event;
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        const touches = e.touches;
        const target = touches ? touches[0] : e;
        this.startingPoint =
            this.direction === 'horizontal' ? target.clientX : target.clientY;
        this.startTime = time();
        this.isTracking = true;
        this.captureClick = false;
        if (this.disabledHandSlideing)
            return;
    }
    move(ev) {
        if (!this.isTracking) {
            return;
        }
        const e = ev || event;
        if (e.type === 'mousemove') {
            this.captureClick = true;
        }
        e.preventDefault();
        if (this.disabledHandSlideing)
            return;
        const touches = e.changedTouches;
        const target = touches ? touches[0] : e;
        const moved = this.direction === 'horizontal'
            ? target.clientX - this.startingPoint
            : target.clientY - this.startingPoint;
        this.clear();
        const scale = Math.max(0, 1 - Math.abs(moved / this.scaleSize));
        this.fadeProcess(moved, scale);
    }
    end(ev) {
        if (!this.isTracking) {
            return;
        }
        this.isTracking = false;
        if (this.disabledHandSlideing)
            return;
        const e = ev || event;
        const touches = e.changedTouches;
        const target = touches ? touches[0] : e;
        let moved = this.direction === 'horizontal'
            ? target.clientX - this.startingPoint
            : target.clientY - this.startingPoint;
        const duration = time() - this.startTime;
        const enter = Math.abs(moved) > this.scaleSize / 2 || duration < 300;
        const scale = Math.max(0, 1 - Math.abs(moved / this.scaleSize));
        const loop = this.loop;
        const oldIndex = this.index;
        const length = this.length;
        const maxIndex = length - 1;
        if (Math.abs(moved) === 0) {
            return;
        }
        if (enter) {
            const newIndex = this.fadeSetIndex(moved);
            const isToNext = loop ? oldIndex : null;
            if (newIndex !== parseInt(newIndex + '')) {
                console.log(128);
            }
            this.startMove(1 - scale, 1, fadeFloat, (n) => {
                this.fadeMove(n, newIndex, isToNext);
            }).then(() => {
                this.enter(this.index);
                if (this.auto) {
                    this.clear();
                    this.timer = this.setInterval();
                }
            });
        }
        else {
            let newIndex = this.index;
            if (moved < 0) {
                newIndex += 1;
                if (newIndex > maxIndex) {
                    newIndex = 0;
                }
            }
            else {
                newIndex -= 1;
                if (newIndex < 0) {
                    newIndex = maxIndex;
                }
            }
            this.startMove(scale, 1, fadeFloat, (n) => {
                this.fadeMove(n, this.index, newIndex);
            }).then(() => {
                this.enter(this.index);
                if (this.auto) {
                    this.clear();
                    this.timer = this.setInterval();
                }
            });
        }
    }
    moveTo(index) {
        this.clear();
        index = Math.abs(index);
        const maxIndex = this.length - 1;
        if (index > maxIndex) {
            index = maxIndex;
        }
        const oldIndex = this.index;
        const newIndex = (this.index = index);
        if (newIndex === oldIndex)
            return;
        this.callback(newIndex);
        this.startMove(0, 1, fadeFloat, (n) => {
            this.fadeMove(n, newIndex, oldIndex);
        }).then(() => {
            this.enter(this.index);
            if (this.auto) {
                this.clear();
                this.timer = this.setInterval();
            }
        });
    }
    fadeMove(scale = 1, index, oldIndex) {
        let length = this.length;
        let list = this.children;
        for (let i = 0; i < length; i++) {
            list[i]['style'].opacity = 0;
            list[i]['style']['z-index'] = 0;
        }
        try {
            list[index]['style']['opacity'] = scale;
            list[index]['style']['z-index'] = 1;
            if (typeof oldIndex === 'number') {
                list[oldIndex]['style'].opacity = 1 - scale;
            }
        }
        catch (error) {
            console.log(194, index, scale, oldIndex);
        }
    }
    aotoplay() {
        const fade_startplay = () => {
            const oldIndex = this.index;
            this.index += 1;
            if (this.index > this.length - 1) {
                this.index = 0;
            }
            const newIndex = this.index;
            this.callback(newIndex);
            this.startMove(0, 1, fadeFloat, (n) => {
                this.fadeMove(n, newIndex, oldIndex);
            }).then(() => {
                this.enter(this.index);
            });
        };
        return fade_startplay();
    }
    fadeProcess(moved, scale) {
        const maxIndex = this.length - 1;
        const oldIndex = this.index;
        let newIndex = this.index;
        if (moved < 0) {
            newIndex += 1;
            if (newIndex > maxIndex) {
                newIndex = 0;
            }
        }
        else {
            newIndex -= 1;
            if (newIndex < 0) {
                newIndex = maxIndex;
            }
        }
        if (oldIndex !== parseInt(oldIndex + '')) {
            console.log(11111);
        }
        this.fadeMove(scale, oldIndex, newIndex);
    }
    fadeSetIndex(moved) {
        const loop = this.loop;
        const oldIndex = this.index;
        if (moved > 0) {
            this.index -= 1;
            if (this.index < 0) {
                if (loop) {
                    this.index = this.length - 1;
                }
                else {
                    this.index = 0;
                }
            }
        }
        if (moved < 0) {
            this.index += 1;
            if (this.index > this.length - 1) {
                if (loop) {
                    this.index = 0;
                }
                else {
                    this.index = this.length - 1;
                }
            }
        }
        if (oldIndex === this.index) {
            return this.index;
        }
        this.callback(this.index);
        return this.index;
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
        document.addEventListener('visibilitychange', this._visibilitychange);
    }
}

const createSlideSwiper = (options) => {
    return new FineSlideSwiper(options);
};
const cresteFadeSwiper = (options) => {
    return new FineFideSwiper(options);
};
var FineSwiper = {
    createSlideSwiper,
    cresteFadeSwiper
};

export default FineSwiper;
