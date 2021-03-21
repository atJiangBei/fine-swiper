import Swiper from './swiper'
import { Options, timer } from './../type/index'
import { time } from './../util/index'
const fadeFloat: number = 0.05

class FineFideSwiper extends Swiper {
  private _start: (event: Event) => void
  private _move: (event: Event) => void
  private _end: (event: Event) => void
  constructor(props: Options) {
    super(props)
    this.initSetIndex(props.index)
    this.ifEffectFade()
    if (this.auto) {
      this.timer = this.setInterval()
    }
    this._start = ev => {
      this.start(ev)
    }
    this._move = ev => {
      this.move(ev)
    }
    this._end = ev => {
      this.end(ev)
    }
    this.slider.addEventListener('touchstart', this._start, this.will)
    this.slider.addEventListener('touchmove', this._move, this.will)
    this.slider.addEventListener('touchend', this._end, this.will)
    this.slider.addEventListener('touchcancel', this._end, this.will)
    this.slider.addEventListener('mousedown', this._start, this.will)
    this.slider.addEventListener('mousemove', this._move, this.will)
    this.slider.addEventListener('mouseup', this._end, this.will)
  }
  _visibilitychange() {
    if (document.hidden) {
      this.clear()
    } else {
      if (this.auto) {
        this.timer = this.setInterval()
      }
    }
  }
  public setInterval(): timer {
    return window.setInterval(this.aotoplay.bind(this), this.delayed)
  }
  private initSetIndex(index: number) {
    index = Math.min(Math.abs(index), this.length - 1)
    this.index = index
  }
  private ifEffectFade() {
    const children = this.children
    const scaleHeight = this.scaleHeight
    const length = this.length
    for (let i = 0; i < length; i++) {
      children[i]['style'].transform =
        'translate3d(0,' + -i * scaleHeight + 'px,0)'
    }
    this.fadeMove(1, this.index)
  }
  private start(ev) {
    const e = ev || event
    if (e.type === 'mousedown') {
      //On the PC side, default events are disabled in MouseDown events
      //For example, there are jump links in sliding elements, and if default events are not prohibited, jumps are made.
      //360 Browser
      e.preventDefault()
    }
    const touches = e.touches
    const target = touches ? touches[0] : e
    this.startingPoint =
      this.direction === 'horizontal' ? target.clientX : target.clientY
    this.startTime = time()
    this.isTracking = true
    this.captureClick = false
    if (this.disabledHandSlideing) return
  }
  private move(ev) {
    if (!this.isTracking) {
      //Disabled sliding after loosening the mouse
      return
    }
    const e = ev || event
    if (e.type === 'mousemove') {
      this.captureClick = true
    }
    //Default events are prohibited when sliding events occur on the mobile side(For example, click events)
    e.preventDefault()
    if (this.disabledHandSlideing) return
    const touches = e.changedTouches
    const target = touches ? touches[0] : e
    const moved =
      this.direction === 'horizontal'
        ? target.clientX - this.startingPoint
        : target.clientY - this.startingPoint
    this.clear()

    const scale = Math.max(0, 1 - Math.abs(moved / this.scaleSize))
    this.fadeProcess(moved, scale)
  }
  private end(ev) {
    if (!this.isTracking) {
      return
    }
    this.isTracking = false
    if (this.disabledHandSlideing) return
    const e = ev || event
    const touches: Array<object> = e.changedTouches
    const target = touches ? touches[0] : e
    let moved: number =
      this.direction === 'horizontal'
        ? target.clientX - this.startingPoint
        : target.clientY - this.startingPoint
    const duration: number = time() - this.startTime
    const enter: boolean =
      Math.abs(moved) > this.scaleSize / 2 || duration < 300
    const scale: number = Math.max(0, 1 - Math.abs(moved / this.scaleSize))
    const loop: boolean = this.loop
    const oldIndex: number = this.index
    const length: number = this.length
    const maxIndex: number = length - 1
    if (Math.abs(moved) === 0) {
      return
    }
    if (enter) {
      const newIndex: number = this.fadeSetIndex(moved)
      const isToNext: number | null = loop ? oldIndex : null
      if (newIndex !== parseInt(newIndex + '')) {
        console.log(128)
      }
      this.startMove(1 - scale, 1, fadeFloat, (n: number) => {
        this.fadeMove(n, newIndex, isToNext)
      }).then(() => {
        this.enter(this.index)
        if (this.auto) {
          this.clear()
          this.timer = this.setInterval()
        }
      })
    } else {
      let newIndex: number = this.index
      if (moved < 0) {
        newIndex += 1
        if (newIndex > maxIndex) {
          newIndex = 0
        }
      } else {
        newIndex -= 1
        if (newIndex < 0) {
          newIndex = maxIndex
        }
      }
      this.startMove(scale, 1, fadeFloat, (n: number) => {
        this.fadeMove(n, this.index, newIndex)
      }).then(() => {
        this.enter(this.index)
        if (this.auto) {
          this.clear()
          this.timer = this.setInterval()
        }
      })
    }
  }
  moveTo(index: number): void {
    this.clear()
    index = Math.abs(index)
    const maxIndex: number = this.length - 1
    if (index > maxIndex) {
      index = maxIndex
    }
    const oldIndex: number = this.index
    const newIndex: number = (this.index = index)
    if (newIndex === oldIndex) return
    this.callback(newIndex)
    this.startMove(0, 1, fadeFloat, (n: number) => {
      this.fadeMove(n, newIndex, oldIndex)
    }).then(() => {
      this.enter(this.index)
      if (this.auto) {
        this.clear()
        this.timer = this.setInterval()
      }
    })
  }
  private fadeMove(scale: number = 1, index: number, oldIndex?: number) {
    let length = this.length
    let list = this.children
    for (let i = 0; i < length; i++) {
      list[i]['style'].opacity = 0
      list[i]['style']['z-index'] = 0
    }
    try {
      list[index]['style']['opacity'] = scale
      list[index]['style']['z-index'] = 1
      if (typeof oldIndex === 'number') {
        list[oldIndex]['style'].opacity = 1 - scale
      }
    } catch (error) {
      console.log(194, index, scale, oldIndex)
    }
  }
  private aotoplay() {
    const fade_startplay = (): void => {
      const oldIndex = this.index
      this.index += 1
      if (this.index > this.length - 1) {
        this.index = 0
      }
      const newIndex: number = this.index
      this.callback(newIndex)
      this.startMove(0, 1, fadeFloat, (n: number) => {
        this.fadeMove(n, newIndex, oldIndex)
      }).then(() => {
        this.enter(this.index)
      })
    }

    return fade_startplay()
  }
  private fadeProcess(moved: number, scale: number) {
    //Calculate the next subscript in the sliding process,
    //find a new coordinate,
    //and calculate the transparency of the current and transitional coordinates according to the sliding ratio.
    const maxIndex: number = this.length - 1
    const oldIndex: number = this.index
    let newIndex: number = this.index
    if (moved < 0) {
      newIndex += 1
      if (newIndex > maxIndex) {
        newIndex = 0
      }
    } else {
      newIndex -= 1
      if (newIndex < 0) {
        newIndex = maxIndex
      }
    }
    if (oldIndex !== parseInt(oldIndex + '')) {
      console.log(11111)
    }
    this.fadeMove(scale, oldIndex, newIndex)
  }
  private fadeSetIndex(moved: number): number {
    //This applies to non-added loops//fade status
    const loop: boolean = this.loop
    const oldIndex: number = this.index
    if (moved > 0) {
      this.index -= 1
      if (this.index < 0) {
        if (loop) {
          this.index = this.length - 1
        } else {
          this.index = 0
        }
      }
    }
    if (moved < 0) {
      this.index += 1
      if (this.index > this.length - 1) {
        if (loop) {
          this.index = 0
        } else {
          this.index = this.length - 1
        }
      }
    }
    if (oldIndex === this.index) {
      return this.index
    }
    this.callback(this.index)
    return this.index
  }
  destroy() {
    this.clear()
    this.slider.removeEventListener('touchstart', this._start, this.will)
    this.slider.removeEventListener('touchmove', this._move, this.will)
    this.slider.removeEventListener('touchend', this._end, this.will)
    this.slider.removeEventListener('mousedown', this._start, this.will)
    this.slider.removeEventListener('mousemove', this._move, this.will)
    this.slider.removeEventListener('mouseup', this._end, this.will)
    this.slider.removeEventListener('click', this._closeDefault, true)
    document.addEventListener('visibilitychange', this._visibilitychange)
  }
}

export default FineFideSwiper
